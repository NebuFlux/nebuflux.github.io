"""
Inference Network Monitor StateMachine

Implements a three-state machine (idle -> monitor -> hibernate) that
captures live TCP/IP traffic, extracts flow-level features, classifies
each flow with a TFLite ANN model, and forwards detected threats to a
cloud backend via a REST API.
"""
# ------------------------------------------------------------------
# Change History
# ------------------------------------------------------------------
# Version   |   Description
# ------------------------------------------------------------------
#    1          Initial Development
#    1.1        Added Google-style docstrings and improved inline
#               comments for clarity
#    1.2        Improved error handling in Alert System. Changed 
#               pyckle imports to joblib. Corrected scaler, label
#               encoder, ANN output categories, and 
# ------------------------------------------------------------------
__author__ = "Joshua Shoemaker"
__version__ = "1.1.0"
#
# Import necessary to provide timing in the main loop
#
from time import sleep, time
from datetime import datetime
from datetime import timedelta

#
# Imports required to allow us to build a fully functional state machine
#
from statemachine import StateMachine, State
from statemachine.exceptions import TransitionNotAllowed

# Networking imports
from scapy.all import sniff, IP, TCP, AsyncSniffer

# General imports for data structures, threading, and interfaces
from collections import defaultdict
import queue
import threading
import sys

# Data modeling & AI imports
import numpy as np
# Use the following line on Pi environment
import tflite_runtime.interpreter as tflite
# use for desktop
# import tensorflow as tf
# import tensorflow as tf
import joblib

# Environment variables & server update imports
import os
from dotenv import load_dotenv
import requests

# DEBUG flag - boolean value to indicate whether to print
# status messages on the console of the program
#
DEBUG = True


# class to send alerts to cloud backend server
class Alert_System:
    """Manages asynchronous alert delivery to the cloud backend REST API.

    Runs a dedicated background thread that drains a shared alert queue,
    performs a periodic heartbeat check against the server, and POSTs
    batches of alert records.  Any communication failures are written to
    a local log file so no alert data is lost.
    """

    def __init__(self):
        """Initialises the Alert_System by reading credentials from the
        environment and creating the synchronisation primitives used by
        the background thread.

        Raises:
            KeyError: If the ``API_KEY`` or ``SERVER_URL`` environment
                variables are not set.
        """
        load_dotenv()
        self.key = os.getenv('API_KEY')
        self.api_url = os.getenv('SERVER_URL')
        # Event used to signal the alert thread to stop gracefully
        self.alert_event = threading.Event()
        self.alert_thread = None
        self.sent_alerts = 0

    def send_alerts(self, alert_queue):
        """Starts the background thread that consumes alerts and POSTs them
        to the cloud backend.

        The thread collects up to 30 alerts per iteration, verifies server
        reachability with a GET heartbeat, then sends the batch via POST.
        Errors are logged locally rather than raising exceptions so that
        the monitor loop is never interrupted by transient network issues.

        Args:
            alert_queue (queue.Queue): Shared queue populated by
                :class:`Inference_Model` whenever a non-BENIGN flow is
                detected.
        """
        self.alert_event.clear()
        def alert_thread(alert_queue):
            # Heartbeat counter for empty list
            time_counter = datetime.now()
            while not self.alert_event.is_set():

                # List hold alert batch for multiple database inserts.
                alert_list = list()

                # check for empty queue.
                # keep cycling until queue is empty longer than an hour.
                if alert_queue.empty() and datetime.now() < time_counter + timedelta(hours = 1):
                    sleep(5)
                    remaining = (time_counter + timedelta(hours=1)) - datetime.now()
                    print(f"Time till heartbeat: {int(remaining.total_seconds() // 60):02d}:{int(remaining.total_seconds() % 60):02d}")
                    continue
                else:
                    time_counter = datetime.now()
                
                
                # Heartbeat GET confirms the server is reachable before posting
                try:
                    heartbeat = requests.get(url =f'{self.api_url}/heartbeat', headers = {'Authorization': f'Bearer {self.key}'}, timeout=5)
                except requests.exceptions.Timeout:
                    self.log_errors(activities = [], occasion = {"heartbeat": "Timeout"}, time = datetime.now())
                    continue

                # log hearbeat errors and skip posting 
                if heartbeat.status_code != 200 :
                    try:
                        msg = heartbeat.json().get("message", heartbeat.text)
                    except Exception:
                        msg = heartbeat.text
                    self.log_errors(activities = [], occasion = {"heartbeat": f"{heartbeat.status_code} - {msg}"}, time = datetime.now())
                    continue

                # Drain up to 30 items per cycle; skip if the queue is empty
                for _ in range(29):
                    try:
                        alert_list.append(alert_queue.get(timeout=1))
                    except queue.Empty: continue
                
                # Post to database api
                try:
                    response = requests.post(url = f'{self.api_url}/alerts',
                                            json = alert_list,
                                            headers = {'Authorization': f'Bearer {self.key}'},
                                            timeout=5
                                            )
                    self.sent_alerts += 1
                    print(f'{self.sent_alerts}: Sent So Far!')
                # Catch all requests exceptions
                except requests.exceptions.RequestException as e:
                    # log in local storage file.
                    self.log_errors(activities = alert_list, occasion = {"Post": f"{e}"}, time = datetime.now())
                    continue

                if response.status_code != 201 :
                    try:
                        msg = response.json().get("message", response.text)
                    except Exception:
                        msg = response.text
                    self.log_errors(activities = alert_list, occasion = {"Post": f"{response.status_code} - {msg}"}, time = datetime.now())

        self.alert_thread = threading.Thread(target=alert_thread, args=(alert_queue,))
        self.alert_thread.start()

    def stop(self):
        """Signals the alert thread to stop and blocks until it exits."""
        self.alert_event.set()
        self.alert_thread.join()

    def log_errors(self, activities, occasion, time):
        """Appends a structured error record to the local log file.

        Each call writes one or more header lines describing the error
        event followed by indented lines for every alert that was being
        sent at the time of the failure.

        Args:
            activities (list[dict]): The batch of alert dictionaries that
                could not be delivered.
            occasion (dict): A mapping describing the error, e.g.
                ``{"heartbeat": "Timeout"}`` or ``{"post": 500}``.
            time (datetime): Timestamp captured at the moment of failure.
        """
        lines = [f'{k}: {v}  {time}\n' for k, v in occasion.items()]
        for activity in activities:
            lines += [f'\t{k}: {v}\n' for k, v in activity.items()]
        with open("Network_Monitor_log.txt", "a") as file:
            file.writelines(lines)


# Section
# Class to run the inference thread
class Inference_Model:
    """Wraps a TFLite model and drives continuous threat classification.

    Loads a ``.tflite`` model file and a pre-fitted scikit-learn scaler,
    then runs a background thread that pulls feature dictionaries from a
    shared queue, normalises them, invokes the interpreter, and routes
    any non-BENIGN results to an alert queue consumed by
    :class:`Alert_System`.
    """

    def __init__(self, model):
        """Loads the TFLite interpreter, the feature scaler, and defines
        the classification label set.

        Args:
            model (str): Filesystem path to the ``.tflite`` model file.
        """
        # Event used to signal the inference thread to stop gracefully
        self.stop_inference = threading.Event()
        self.inference_thread = None
        self.analyzed_packets = 0
        # Queue through which classified threats flow to Alert_System
        self.alert_queue = queue.Queue()
        # self.interpreter = tf.lite.Interpreter(model_path=model)
        # use this line when running on pi
        self.interpreter = tflite.Interpreter(model_path=model)

        # Load in scaler created during training.
        self.scaler = joblib.load('NMMscaler.joblib')

        # Load in label encoder used in training to create labels.
        self.le = joblib.load('NMMlabel_encoder.joblib')
        self.labels = list(self.le.classes_)

    def alert_callback(self, result, data):
        """Evaluates a model output and enqueues an alert when the
        predicted class is not BENIGN.

        Args:
            result (numpy.ndarray): Raw softmax output tensor from the
                TFLite interpreter (shape ``[1, num_classes]``).
            data (dict): The original feature dictionary for the flow,
                which must contain at minimum the keys ``src``, ``sport``,
                ``dst``, and ``Destination Port``.
        """
        self.analyzed_packets += 1
        print(f'Analyzed {self.analyzed_packets} flows!')
        label_index = np.argmax(result)
        result_label = self.labels[label_index]
        if result_label != 'BENIGN':
            alert = {
                "source": data['src'],
                "source_port": data['sport'],
                "destination": data['dst'],
                "destination_port": data['Destination Port'],
                "category": result_label,
                "reported": datetime.now().isoformat()
            }
            self.alert_queue.put(alert)

    def start_inference(self, feature_queue):
        """Allocates TFLite tensors and starts the background inference
        thread.

        The thread continuously pulls feature dictionaries from
        ``feature_queue``, applies the scaler, runs the model, and calls
        :meth:`alert_callback` with the result.  It blocks on the queue
        with a 1-second timeout so the stop event is checked regularly.

        Args:
            feature_queue (queue.Queue): Shared queue populated by
                :class:`TrafficAnalyzer` with 19-feature flow records.
        """
        self.interpreter.allocate_tensors()
        self.stop_inference.clear()
        input_details = self.interpreter.get_input_details()
        output_details = self.interpreter.get_output_details()

        def inference_thread(feature_queue):
            while not self.stop_inference.is_set():
                # pull data from feature queue; skip cycle if nothing is available
                try:
                    data = feature_queue.get(timeout=1)
                # skip if no data
                except queue.Empty: 
                    sleep(3)
                    continue

                # Slice the first 19 numeric features; the last 3 keys are
                # metadata (src, sport, dst) and must be excluded from inference
                numpy_data = np.array(list(data.values()))[:-3]
                numpy_data = self.scaler.transform(numpy_data.reshape(1, 19).astype(np.float32))
                self.interpreter.set_tensor(input_details[0]['index'], numpy_data)
                self.interpreter.invoke()
                result = self.interpreter.get_tensor(output_details[0]['index'])
                self.alert_callback(result, data)

        self.inference_thread = threading.Thread(target=inference_thread, args=(feature_queue,))
        self.inference_thread.start()

    def stop(self):
        """Signals the inference thread to stop and blocks until it exits."""
        self.stop_inference.set()
        self.inference_thread.join()
# End Section

# Section
# Title: Packet Capture Engine
# Author: Chaitanya Rahalkar
# Date published: January 21, 2025
# Publisher: freeCodeCamp
# URL: https://www.freecodecamp.org/news/build-a-real-time-intrusion-detection-system-with-python/
# Date downloaded: March 17, 2026
class PacketCapture:
    """Captures raw TCP/IP packets from a network interface into a queue.

    Uses Scapy's :func:`sniff` in a background thread so that packet
    capture never blocks the main state-machine loop.  Only packets that
    contain both an IP layer and a TCP layer are enqueued; all others are
    silently dropped.
    """

    def __init__(self):
        """Initialises the packet queue and the stop-capture event."""
        # Bounded queue prevents unbounded memory growth under high traffic
        self.packet_queue = queue.Queue(maxsize=2000)
        self.stop_capture = threading.Event()
        self.capture_thread = None

    def packet_callback(self, packet):
        """Scapy callback invoked for every captured packet.

        Filters to TCP/IP packets only and places them on the shared
        queue for downstream analysis.

        Args:
            packet (scapy.packet.Packet): Raw packet delivered by Scapy's
                sniff engine.
        """
        if IP in packet and TCP in packet:
            self.packet_queue.put(packet)

    def start_capture(self, interface="eth0"):
        """Starts packet capture on the specified interface in a background
        thread.

        Args:
            interface (str): Name of the network interface to sniff on.
                Defaults to ``"eth0"``.
        """
        self.stop_capture.clear()
        def capture_thread():
            sniff(iface=interface,
                  prn=self.packet_callback,
                  store=0,
                  # stop_filter polls the event so the thread exits cleanly
                  stop_filter=lambda _: self.stop_capture.is_set())

        self.capture_thread = threading.Thread(target=capture_thread)
        self.capture_thread.start()

    def stop(self):
        """Signals the capture thread to stop and blocks until it exits."""
        self.stop_capture.set()
        self.capture_thread.join()
# End Section


# Section
# The following code structurally from the accredited source, although,
# a fair amount of customization has been performed to accomplish the spefic
# feature extraction.
# Title: Traffic Analysis Module
# Author: Chaitanya Rahalkar
# Date published: January 21, 2025
# Publisher: freeCodeCamp
# URL: https://www.freecodecamp.org/news/build-a-real-time-intrusion-detection-system-with-python/
# Date downloaded: March 17, 2026
class TrafficAnalyzer:
    """Aggregates per-flow statistics from raw packets and extracts the
    19 numeric features expected by the ANN model.

    Maintains a dictionary of in-progress flow records keyed by a
    canonical (bidirectional) flow identifier.  When a flow reaches
    25 packets or receives a FIN flag the record is finalised, its
    features are computed, and the resulting dictionary is placed on
    ``feature_queue`` for the inference engine.
    """

    def __init__(self):
        """Initialises the flow statistics store and the feature output queue."""
        # defaultdict auto-creates an empty stats record for every new flow key
        self.flow_stats = defaultdict(lambda: {
            'Fwd Packet Length list': [],
            'Bwd Packet Length list': [],
            'Fwd IAT list': [],
            'Bwd IAT list': [],
            'FIN Flag Count': 0,
            'PSH Flag Count': 0,
            'URG Flag Count': 0,
            'last_fwd_time': None,
            'last_bwd_time': None,
            'packet_count': 0,
            'Destination Port': None,
            'src': None,
            'sport': 0,
            'dst': None
        })
        # Bounded queue prevents memory growth if inference falls behind capture
        self.feature_queue = queue.Queue(maxsize=2000)
        self.timer = datetime.now()
        self.tracked_flows = 0

    def analyze_packet(self, packet):
        """Updates flow statistics for a single packet and, when a flow is
        complete, extracts its features and enqueues them.

        A flow is considered complete when it exceeds 25 packets (giving
        enough statistical data) or when a FIN flag is observed (signalling
        an orderly TCP close).  Incomplete flows whose SYN handshake was
        never observed are discarded immediately to avoid polluting the
        feature queue with meaningless records.

        Args:
            packet (scapy.packet.Packet): A packet that must contain both
                an IP layer and a TCP layer.

        Returns:
            None: Results are communicated via ``self.feature_queue`` rather
                than a return value.
        """
        if IP in packet and TCP in packet:
            # Evict the 100 oldest flows when the table exceeds 5000 entries
            # to bound memory use under sustained high-traffic conditions
            if len(self.flow_stats) >= 5000:
                for i in range(100):
                    oldest = next(iter(self.flow_stats))
                    del self.flow_stats[oldest]

            src = packet[IP].src
            sport = packet[TCP].sport
            dst = packet[IP].dst
            dport = packet[TCP].dport
            flow_key = self.get_flow_key(src, dst, sport, dport)
            fwd = None

            # Update flow statistics
            stats = self.flow_stats[flow_key]
            if len(self.flow_stats) != self.tracked_flows:
                self.tracked_flows = len(self.flow_stats)
                print(f'flows tracking: {self.tracked_flows}')

            # SYN without ACK => initial connection request; record originator metadata
            if 'S' in packet[TCP].flags and 'A' not in packet[TCP].flags:
                stats['Destination Port'] = (dport)
                stats['src'] = src
                stats['sport'] = sport
                stats['dst'] = dst
            # SYN-ACK => server reply; flip src/dst so 'src' always reflects the client
            elif 'S' in packet[TCP].flags and 'A' in packet[TCP].flags:
                stats['Destination Port'] = (sport)
                stats['src'] = dst
                stats['sport'] = dport
                stats['dst'] = src
            elif not stats['Destination Port']:
                # Flow seen mid-stream; assign as-is so it still reaches inference
                stats['Destination Port'] = dport
                stats['src'] = src
                stats['sport'] = sport
                stats['dst'] = dst

            # Determine packet direction relative to the original connection initiator
            if stats['Destination Port'] == sport:
                fwd = False  # packet is travelling from server back to client (backward)
            elif stats['Destination Port'] == dport:
                fwd = True   # packet is travelling from client to server (forward)

            stats['packet_count'] += 1
            stats['FIN Flag Count'] += 1 if 'F' in packet[TCP].flags else 0
            stats['PSH Flag Count'] += 1 if 'P' in packet[TCP].flags else 0
            stats['URG Flag Count'] += 1 if 'U' in packet[TCP].flags else 0
            if fwd:
                stats['Fwd Packet Length list'].append(packet[IP].len)
                if stats['last_fwd_time'] is not None:
                    stats['Fwd IAT list'].append(packet.time - stats['last_fwd_time'])
                stats['last_fwd_time'] = packet.time
            else:
                stats['Bwd Packet Length list'].append(packet[IP].len)
                if stats['last_bwd_time'] is not None:
                    stats['Bwd IAT list'].append(packet.time - stats['last_bwd_time'])
                stats['last_bwd_time'] = packet.time

            # Flow is ready when it has enough packets for reliable statistics
            if stats['packet_count'] > 25:
                try:
                    self.feature_queue.put_nowait(self.extract_attributes(stats))
                    del self.flow_stats[flow_key]
                except queue.Full: pass
            elif stats['FIN Flag Count'] > 1:
                # FIN observed - flow is closing; extract features now
                try:
                    self.feature_queue.put_nowait(self.extract_attributes(stats))
                    del self.flow_stats[flow_key]
                except queue.Full: pass
            elif self.timer + timedelta(hours=1) < datetime.now():
                old_flows = list()
                self.timer = datetime.now()
                for k, s in self.flow_stats.items():
                    last_packet = s['last_bwd_time']
                    if last_packet and packet.time - last_packet > 3600:
                        self.feature_queue.put_nowait(self.extract_attributes(s))
                        old_flows.append(k)
                    elif packet.time - s['last_fwd_time'] > 3600:
                        self.feature_queue.put_nowait(self.extract_attributes(s))
                        old_flows.append(k)

                for key in old_flows:
                    del self.flow_stats[key]



    def get_flow_key(self, src, dst, sport, dport):
        """Generates a canonical, bidirectional key for a TCP flow.

        By sorting the two endpoint tuples, packets travelling in either
        direction map to the same key, so forward and backward traffic
        accumulate into a single flow record.

        Args:
            src (str): Source IP address.
            dst (str): Destination IP address.
            sport (int): Source TCP port.
            dport (int): Destination TCP port.

        Returns:
            tuple: A 2-tuple of endpoint tuples
                ``((lower_ip, lower_port), (higher_ip, higher_port))``
                that uniquely identifies the flow regardless of direction.
        """
        first = (src, sport)
        second = (dst, dport)
        # sort to always have same key regardless of packet direction
        flow_key = (min(first, second), max(first, second))

        return flow_key

    def extract_attributes(self, stats):
        """Computes the 19 numeric feature values required by the ANN model
        from a completed flow's accumulated statistics.

        The feature set matches the columns the model was trained on (a
        subset of the CIC-IDS-2017 feature space).  Three metadata keys
        (``src``, ``sport``, ``dst``) are appended so the downstream
        alert callback can include connection details in the alert record
        without requiring a separate lookup.

        Args:
            stats (dict): A flow statistics record as stored in
                ``self.flow_stats``, containing packet-length lists,
                IAT lists, TCP flag counts, and connection metadata.

        Returns:
            dict: A dictionary with 19 numeric features followed by the
                three metadata keys.  Any ``NaN`` values produced by
                operations on empty lists (e.g. ``np.std([])``) are
                replaced with ``0.0`` to keep the tensor well-formed.
        """
        # Merge forward and backward lists for flow-level aggregate stats
        packet_len_list = [*stats['Bwd Packet Length list'], *stats['Fwd Packet Length list']]
        flow_iat = [*stats['Fwd IAT list'], *stats['Bwd IAT list']]
        attributes = {
            'Bwd Packet Length Std': np.std(stats['Bwd Packet Length list']),
            'Avg Bwd Segment Size': np.average(stats['Bwd Packet Length list']),
            'Packet Length Std': np.std(packet_len_list),
            'Fwd IAT Std': np.std(stats['Fwd IAT list']),
            'Packet Length Variance': np.var(packet_len_list),
            'Average Packet Size': np.average(packet_len_list),
            'Flow IAT Std': np.std(flow_iat),
            'FIN Flag Count': stats['FIN Flag Count'],
            'Fwd IAT Total': np.sum(stats['Fwd IAT list']),
            'PSH Flag Count': stats['PSH Flag Count'],
            'Flow IAT Mean': np.mean(flow_iat),
            'Bwd IAT Std': np.std(stats['Bwd IAT list']),
            'Fwd IAT Mean': np.mean(stats['Fwd IAT list']),
            'Bwd IAT Max': max(stats['Bwd IAT list']) if stats['Bwd IAT list'] else 0,
            'Min Packet Length': min(packet_len_list) if packet_len_list else 0,
            'Bwd Packet Length Min': min(stats['Bwd Packet Length list']) if stats['Bwd Packet Length list'] else 0,
            'URG Flag Count': stats['URG Flag Count'],
            'Destination Port': stats['Destination Port'],
            'Fwd Packet Length Min': min(stats['Fwd Packet Length list']) if stats['Fwd Packet Length list'] else 0,
            # -- metadata appended for alert reporting; excluded from ANN input --
            'src': stats['src'],
            'sport': stats['sport'],
            'dst': stats['dst']
        }

        # Replace any NaN values (e.g. std of an empty list) with 0.0
        # so the tensor fed to the interpreter is always fully numeric
        for k, v in attributes.items():
            if v != v: attributes[k] = 0.0  # NaN is the only value not equal to itself
        return attributes
# End Section


# Section
# NetworkMonitoringModel to track instance variables
class NetworkMonitorModel:
    """Aggregates the four subsystems (capture, analysis, inference, alerts)
    and orchestrates their lifecycle on behalf of the state machine.

    The model is intentionally kept separate from the state-machine class so
    that business logic and state-transition logic remain decoupled.
    """

    def __init__(self, interface, model_file):
        """Creates and wires together all subsystem objects.

        Args:
            interface (str): Network interface name to capture traffic on
                (e.g. ``"eth0"``).
            model_file (str): Filesystem path to the TFLite model file.
        """
        self.model_file = model_file
        self.packet_capture = PacketCapture()
        self.traffic_analyzer = TrafficAnalyzer()
        self.inference_engine = Inference_Model(self.model_file)
        self.alert_system = Alert_System()
        self.interface = interface
        # Event used to signal the monitor thread to stop its processing loop
        self.monitoring_event = threading.Event()
        self.request_wait = threading.Event()

    def start(self, machine):
        """Starts all subsystems and launches the main packet-processing loop.

        The loop dequeues captured packets and forwards them to the traffic
        analyser.  If the packet queue is idle for more than one consecutive
        timeout cycle the state machine is signalled to return to ``idle``
        so that :meth:`on_enter_idle` can sniff for the next packet before
        re-entering ``monitor``.

        Args:
            machine (NetworkMonitorMachine): The owning state machine instance,
                used to send the ``"wait"`` event when the capture queue drains.
        """
        print(f"Now Monitoring the network on interface: {self.interface}")
        self.monitoring_event.clear()
        def monitor_thread():
            if self.packet_capture.capture_thread is None or not self.packet_capture.capture_thread.is_alive():
                print('starting packet capture')
                self.packet_capture.start_capture(self.interface)
            if self.inference_engine.inference_thread is None or not self.inference_engine.inference_thread.is_alive():
                print('starting inference engine')
                self.inference_engine.start_inference(self.traffic_analyzer.feature_queue)
            if self.alert_system.alert_thread is None or not self.alert_system.alert_thread.is_alive():
                print('starting alert system')
                self.alert_system.send_alerts(self.inference_engine.alert_queue)


            # count tracks consecutive empty-queue cycles to detect traffic lulls
            while not self.monitoring_event.is_set():
                try:
                    packet = self.packet_capture.packet_queue.get(timeout=1)
                    count = 0  # reset idle counter whenever a packet arrives
                    self.traffic_analyzer.analyze_packet(packet)
                except queue.Empty:
                    count += 1
                    # After two consecutive idle seconds, yield back to idle state.
                    # The send may race with a transition already in progress from a
                    # prior cycle; swallow the exception and exit this stale thread so
                    # the next on_enter_monitor spawns the sole active monitor_thread.
                    if count > 10:
                        self.request_wait.set()
                        return

        self.monitor_thread = threading.Thread(target=monitor_thread)
        self.monitor_thread.start()

    def add_packet(self, packet):
        """Places a pre-captured packet directly onto the packet queue.

        Used by :meth:`NetworkMonitorMachine.on_enter_idle` to seed the
        queue with the single packet sniffed during the idle probe so it
        is not lost when the machine transitions to ``monitor``.

        Args:
            packet (scapy.packet.Packet): A Scapy packet object to enqueue.
        """
        self.packet_capture.packet_queue.put(packet)

    def stop(self):
        """Signals the monitor loop to exit and shuts down all subsystem threads.

        Only calls ``stop()`` on threads that are still alive to avoid
        joining already-finished threads.
        """
        self.monitoring_event.set()
        if self.packet_capture.capture_thread.is_alive(): self.packet_capture.stop()
        if self.inference_engine.inference_thread.is_alive(): self.inference_engine.stop()
        if self.alert_system.alert_thread.is_alive(): self.alert_system.stop()
        if hasattr(self, 'monitor_thread') and self.monitor_thread.is_alive():
            self.monitor_thread.join()
# End Section


# Section
# NetworkMonitorMachine - This is our StateMachine implementation class.
# The purpose of this state machine is to manage the three states
# handled by our network monitor:
#
#  idle
#  monitor
#  lockdown
#
#
class NetworkMonitorMachine(StateMachine):
    """A state machine designed to manage our the network monitor"""

    # Define the three states for our machine.
    #
    #  idle - waiting for network traffic
    #  monitor - performing network packet capture, analysis, & reporting
    #  lockdown - stop packet capture during flooding to prevent overwhelming data frames
    #
    idle = State(initial=True)
    monitor = State()
    hibernate = State(final=True)

    # Transitions for our machine.
    start = idle.to(monitor)
    wait = monitor.to(idle)
    stop = idle.to(hibernate) | monitor.to(hibernate)


    def on_enter_idle(self):
        """State entry action for ``idle``.

        Performs a single-packet probe sniff so that the machine does not
        spin in a busy loop when traffic is light.  Once a packet is captured
        it is seeded into the model's packet queue and the ``start`` event
        is sent immediately to transition back to ``monitor``.
        """
        print('entering idle')
        sniffer = AsyncSniffer(iface = self.model.interface, count = 1, filter="ip and tcp")
        sniffer.start()
        sniffer.join()
        for result in sniffer.results:
            self.model.add_packet(result)
        self.send("start")

    def on_enter_monitor(self):
        """State entry action for ``monitor``.

        Delegates to :meth:`NetworkMonitorModel.start`, passing ``self``
        so the monitor thread can send the ``wait`` event back to the
        machine when the packet queue drains.
        """
        self.model.start(self)


    def on_enter_hibernate(self):
        """State entry action for ``hibernate`` (the terminal state).

        Shuts down all subsystem threads cleanly by calling
        :meth:`NetworkMonitorModel.stop`.
        """
        self.model.stop()

    def run(self):
        try:
            while self.configuration != self.hibernate:
                self.model.request_wait.wait()
                self.model.request_wait.clear()
                self.send("wait")
                    
        except KeyboardInterrupt:
            print("Cleaning up and Exiting. . .")
            self.send("stop")
# End Section


# Section
if __name__ == "__main__":
    interface = sys.argv[1] if len(sys.argv) > 1 else 'eth0'
    model_file = sys.argv[2] if len(sys.argv) > 2 else 'Inspector_Gadget_quant.tflite'
    #
    # Set up our State Machine
    #
    network_model = NetworkMonitorModel(interface, model_file)
    nmm = NetworkMonitorMachine(network_model)
    nmm.run()
# End Section
