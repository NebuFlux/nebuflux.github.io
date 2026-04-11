import { GetStaticProps } from 'next';
import { ArtifactData } from '../utility/ArtifactData';
import { codeToHtml } from 'shiki';

export const getStateMachineCode = async(): Promise<ArtifactData> => {

    const highlight = async (code: string) => {
        return await codeToHtml(code, {
            lang: 'python',
            theme: 'ayu-dark'
        })
    }

    const stateMachineCode: ArtifactData = {
        'State Machine': {
            'Definition': {
                "content": "class NetworkMonitorMachine(StateMachine):\n" +
                    "\tidle = State(initial=True)\n" +
                    "\tmonitor = State()\n" +
                    "\thibernate = State(final=True)\n\n" +
                    "\tstart = idle.to(monitor)\n" +
                    "\twait = monitor.to(idle)\n" +
                    "\tstop = idle.to(hibernate) | monitor.to(hibernate)"
            },
            'Run': {
                "content": "def run(self):\n" +
                    "\ttry:\n" +
                    "\t\twhile self.configuration != self.hibernate:\n" +
                    "\t\t\tself.model.request_wait.wait()\n" +
                    "\t\t\tself.model.request_wait.clear()\n" +
                    "\t\t\tself.send('wait')\n" +
                    "\texcept KeyboardInterrupt:\n" +
                    "\t\tself.send('stop')"
            },
            'Enter Idle': {
                "content": "def on_enter_idle(self):\n" +
                    "\tsniffer = AsyncSniffer(iface=self.model.interface, count=1)\n" +
                    "\tsniffer.start()\n" +
                    "\tsniffer.join()\n" +
                    "\tfor result in sniffer.results:\n" +
                    "\t\tself.model.add_packet(result)\n" +
                    "\tself.send('start')"
            }
        },
        'Network Domain Model': {
            'Init': {
                "content": "def __init__(self, interface, model_file):\n" +
                    "\tself.model_file = model_file\n" +
                    "\tself.packet_capture = PacketCapture()\n" +
                    "\tself.traffic_analyzer = TrafficAnalyzer()\n" +
                    "\tself.inference_engine = Inference_Model(self.model_file)\n" +
                    "\tself.alert_system = Alert_System()\n" +
                    "\tself.interface = interface\n" +
                    "\tself.monitoring_event = threading.Event()\n" +
                    "\tself.request_wait = threading.Event()"
            },
            'Monitor Loop': {
                "content": "def monitor_thread():\n" +
                    "\tself.packet_capture.start_capture(self.interface)\n" +
                    "\tself.inference_engine.start_inference(self.traffic_analyzer.feature_queue)\n" +
                    "\tself.alert_system.send_alerts(self.inference_engine.alert_queue)\n\n" +
                    "\tcount = 0\n" +
                    "\twhile not self.monitoring_event.is_set():\n" +
                    "\t\ttry:\n" +
                    "\t\t\tpacket = self.packet_capture.packet_queue.get(timeout=1)\n" +
                    "\t\t\tcount = 0\n" +
                    "\t\t\tself.traffic_analyzer.analyze_packet(packet)\n" +
                    "\t\texcept queue.Empty:\n" +
                    "\t\t\tcount += 1\n" +
                    "\t\t\tif count > 1:\n" +
                    "\t\t\t\tself.request_wait.set()\n" +
                    "\t\t\t\treturn\n" +
                    "\t\t\tcontinue\n\n" +
                    "\tself.packet_capture.stop()"
            }
        },
        'Packet Capture': {
            'Init': {
                "content": "def __init__(self):\n" +
                    "\t# Bounded queue prevents unbounded memory growth under high traffic\n" +
                    "\tself.packet_queue = queue.Queue(maxsize=2000)\n" +
                    "\tself.stop_capture = threading.Event()"
            },
            'Packet Callback': {
                "content": "def packet_callback(self, packet):\n" +
                    "\tif IP in packet and TCP in packet:\n" +
                    "\t\tself.packet_queue.put(packet)"
            }
        },
        'Traffic Analyzer': {
            'Init': {
                "content": "# Bounded queue prevents memory growth if inference falls behind capture\n" +
                    "self.feature_queue = queue.Queue(maxsize=2000)"
            },
            'Flow Table Eviction': {
                "content": "# Evict the 100 oldest flows when the table exceeds 5000 entries\n" +
                    "# to bound memory use under sustained high-traffic conditions\n" +
                    "if len(self.flow_stats) >= 5000:\n" +
                    "\tfor i in range(100):\n" +
                    "\t\toldest = next(iter(self.flow_stats))\n" +
                    "\t\tdel self.flow_stats[oldest]"
            },
            'NaN Catch': {
                "content": "# Replace any NaN values (e.g. std of an empty list) with 0.0\n" +
                    "# so the tensor fed to the interpreter is always fully numeric\n" +
                    "for k, v in attributes.items():\n" +
                    "\tif v != v: attributes[k] = 0.0  # NaN is the only value not equal to itself"
            },
            'Mid-stream Assignment': {
                "content":
                    "elif not stats['Destination Port']:\n" +
                    "\t# Flow seen mid-stream; assign as-is so it still reaches inference\n" +
                    "\tstats['Destination Port'] = dport\n" +
                    "\tstats['src'] = src\n" +
                    "\tstats['sport'] = sport\n" +
                    "\tstats['dst'] = dst"
            },
            'FIN Threshold': {
                "content":
                    "elif stats['FIN Flag Count'] > 1:\n" +
                    "\t# FIN observed - flow is closing; extract features now\n" +
                    "\ttry:\n" +
                    "\t\tself.feature_queue.put_nowait(self.extract_attributes(stats))\n" +
                    "\t\tdel self.flow_stats[flow_key]\n" +
                    "\texcept queue.Full: pass"
            },
            'Stale Flow Sweep': {
                "content":
                    "elif self.timer + timedelta(hours=1) < datetime.now():\n" +
                    "\told_flows = list()\n" +
                    "\tself.timer = datetime.now()\n" +
                    "\tfor k, s in self.flow_stats.items():\n" +
                    "\t\tlast_packet = s['last_bwd_time']\n" +
                    "\t\tif last_packet and packet.time - last_packet > 3600:\n" +
                    "\t\t\tself.feature_queue.put_nowait(self.extract_attributes(s))\n" +
                    "\t\t\told_flows.append(k)\n" +
                    "\t\telif packet.time - s['last_fwd_time'] > 3600:\n" +
                    "\t\t\tself.feature_queue.put_nowait(self.extract_attributes(s))\n" +
                    "\t\t\told_flows.append(k)\n\n" +
                    "\tfor key in old_flows:\n" +
                    "\t\tdel self.flow_stats[key]"
            }
        },
        'Inference Model': {
            'Inference Thread': {
                "content": "def inference_thread(feature_queue):\n" +
                    "\twhile not self.stop_inference.is_set():\n" +
                    "\t\ttry:\n" +
                    "\t\t\tdata = feature_queue.get(timeout=1)\n" +
                    "\t\texcept queue.Empty: continue\n\n" +
                    "\t\t# Slice the first 19 numeric features; the last 3 keys are\n" +
                    "\t\t# metadata (src, sport, dst) and must be excluded from inference\n" +
                    "\t\tnumpy_data = np.array(list(data.values()))[:-3]\n" +
                    "\t\tnumpy_data = self.scaler.transform(numpy_data.reshape(1, 19).astype(np.float32))\n" +
                    "\t\tself.interpreter.set_tensor(input_details[0]['index'], numpy_data)\n" +
                    "\t\tself.interpreter.invoke()\n" +
                    "\t\tresult = self.interpreter.get_tensor(output_details[0]['index'])\n" +
                    "\t\tself.alert_callback(result, data)"
            }
        },
        'Alert System': {
            'Init': {
                "content": "def __init__(self):\n" +
                    "\tself.key = os.environ['API_KEY']\n" +
                    "\tself.api_url = os.environ['SERVER_URL']\n" +
                    "\tself.alert_event = threading.Event()"
            },
            'Heartbeat': {
                "content": "# Heartbeat GET confirms the server is reachable before posting\n" +
                    "try:\n" +
                    "\theartbeat = requests.get(\n" +
                    "\t\turl=f'{self.api_url}/heartbeat',\n" +
                    "\t\theaders={'Authorization': f'Bearer {self.key}'},\n" +
                    "\t\ttimeout=5)\n" +
                    "except requests.exceptions.Timeout:\n" +
                    "\tself.log_errors(activities=[], occasion={'heartbeat': 'Timeout'}, time=datetime.now())\n" +
                    "\tcontinue"
            },
            'Post Alerts': {
                "content": "# Post to database api\n" +
                    "try:\n" +
                    "\tresponse = requests.post(\n" +
                    "\t\turl=f'{self.api_url}/alerts',\n" +
                    "\t\tjson=alert_list,\n" +
                    "\t\theaders={'Authorization': f'Bearer {self.key}'},\n" +
                    "\t\ttimeout=5)\n" +
                    "except requests.exceptions.RequestException as e:\n" +
                    "\t# log in local storage file.\n" +
                    "\tself.log_errors(activities=alert_list, occasion={'Post': f'{e}'}, time=datetime.now())\n" +
                    "\tcontinue"
            }
        },
        'Main': {
            'Entry': {
                "content": "if __name__ == '__main__':\n" +
                    "\tinterface = sys.argv[1] if len(sys.argv) > 1 else 'eth0'\n" +
                    "\tmodel_file = sys.argv[2] if len(sys.argv) > 2 else 'Inspector_Gadget_quant.tflite'\n" +
                    "\tnetwork_model = NetworkMonitorModel(interface, model_file)\n\n" +
                    "\tnmm = NetworkMonitorMachine(network_model)\n" +
                    "\tnmm.run()"
            }
        }
    }

    for (const className in stateMachineCode) {
        for (const functionName in stateMachineCode[className]) {
            for (const contentSection in stateMachineCode[className][functionName]) {
                const code = stateMachineCode[className][functionName][contentSection];
                stateMachineCode[className][functionName][contentSection] = await highlight(code);
            }
        }
    }

    return stateMachineCode;
}
