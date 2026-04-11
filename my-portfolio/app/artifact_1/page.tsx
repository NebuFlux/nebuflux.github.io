import type { ArtifactData } from '../utility/ArtifactData';
import { getStateMachineCode } from './smStaticProps';
import { SiGithub } from "@icons-pack/react-simple-icons";

export default async function Artifact_1() {

  const smCode: ArtifactData = await getStateMachineCode();

  const smDefinition = smCode['State Machine']?.['Definition']?.['content'];
  const domainModelInit = smCode['Network Domain Model']?.['Init']?.['content'];
  const pcBoundedQueue = smCode['Packet Capture']?.['Init']?.['content'];
  const taBoundedQueue = smCode['Traffic Analyzer']?.['Init']?.['content'];
  const packetCallBack = smCode['Packet Capture']?.['Packet Callback']?.['content'];
  const flowTableEviction = smCode['Traffic Analyzer']?.['Flow Table Eviction']?.['content'];
  const NaNCatch = smCode['Traffic Analyzer']?.['NaN Catch']?.['content'];
  const inferenceThread = smCode['Inference Model']?.['Inference Thread']?.["content"];
  const piEnv = smCode['Alert System']?.['Init']?.["content"];
  const heartBeat = smCode['Alert System']?.['Heartbeat']?.["content"];
  const localLog = smCode['Alert System']?.['Post Alerts']?.["content"];
  const enterIdle = smCode['State Machine']?.['Enter Idle']?.['content'];
  const monitorThread = smCode['Network Domain Model']?.['Monitor Loop']?.['content'];
  const smRun = smCode['State Machine']?.['Run']?.['content'];
  const midStreamAssignment = smCode['Traffic Analyzer']?.['Mid-stream Assignment']?.['content'];
  const finThreshold = smCode['Traffic Analyzer']?.['FIN Threshold']?.['content'];
  const staleFlowSweep = smCode['Traffic Analyzer']?.['Stale Flow Sweep']?.['content'];

  return (
    <main className="flex flex-col  p-5 w-full mx-auto lg:max-w-[1600px]">

      <h1 className="text-center">
        Inspector Gadget State Machine
      </h1>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1">
          <h3 className="mt-5 text-center">Where This Started</h3>
          <p className="indent-10">
            The original artifact for this submission is a Python State Machine designed 
            for a Raspberry Pi 4 embedded system to simulate a smart thermostat as a proof 
            of concept. This artifact shows an understanding of several concepts important 
            to embedded programming. While creating the smart thermostat, I explored the 
            growing field of the Internet of Things, safety and security concerns, as well 
            as limitations of embedded smart systems. Embedded architecture particularly 
            piqued my interest, and I’m grateful to have the opportunity to explore the 
            concepts of Advanced RISC Machine (ARM) and System-on-Chip (SoC) architectures. 
            I also explored the intricacies of peripheral integration through serial 
            communication protocols, such as the Inter-Integrated Circuit (I2C), Universal 
            Asynchronous Receiver/Transmitter (UART), and the Serial Peripheral 
            Interface (SPI). If you would like to view both the original and enhanced 
            State Machines you can see them in this GitHub repo <a target="_blank" 
            href="https://github.com/NebuFlux/nebuflux.github.io/tree/main/StateMachine">here</a>
          </p>
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <h3 className="mt-5 text-center">A New Purpose, A New Domain </h3>
          <p className="indent-10">
            The enhancement for the Python State Machine drastically reconfigured the 
            structure and purpose. I selected this artifact because I wanted to 
            demonstrate competency with embedded systems architecture and show that the 
            constraints of edge deployment are not a barrier to implementing meaningful 
            security. I increased the complexity of the state machine by introducing a 
            domain model in accordance with the Python State Machine docs (v3.0). This 
            domain model integrated four components: a network packet retriever, a 
            packet feature extractor, an inference model for traffic classification, 
            and an alarm engine to forward identified traffic to a web server. This 
            expanded the Python state machine to three states and three transitions.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row-reverse  min-w-0 gap-2">
        <p className="indent-10 flex-1">
          The state machine itself is small on purpose. It delegates all of the real 
          work to a separate domain model. Keeping state-transition logic decoupled 
          from business logic is the architectural decision that makes everything 
          else in this file manageable. The three states (`idle`, `monitor`, 
          `hibernate`) and three transitions (`start`, `wait`, `stop`) are all that 
          the machine class has to reason through:
        </p>
        <div key={'State Machine'} className="flex-1 max-w-full rounded-xl 
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: smDefinition}}
        />
      </div>

      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The four components described earlier (packet retriever, feature extractor, 
          inference model, and alarm engine) are each their own class. They are all 
          wired together in <a target="_blank"
          href="https://github.com/NebuFlux/nebuflux.github.io/blob/4b2ad1eb75bce9f68a040b64b10edc5ef5886a78/StateMachine/Network_Monitor_SM.py#L567-L652"
          >NetworkMonitorModel.__init__
            <span className="translate-y-0.5">
              <SiGithub className="fill-blue-400 -ml-2 mb-2" size={10}/>
            </span>
          </a>. 
          This is the "<em>domain model</em>" the Python State Machine library expects, and a 
          organized way to seperate concerns with modular design. This highlights the 
          brilliance of <strong>Object Oriented Programming</strong>. If any one of 
          these four responsibilities needs to change (a new capture library, a 
          different model, a different backend), only its class changes. The state 
          machine itself stays still. This state machine successfully demonstrates
          a modular design, separation of concerns, and a deliberate mapping of a 
          problem domain onto a state-machine abstraction.
        </p>
        <div key={'Domain Model Init'} className="w-fit max-w-full rounded-xl 
        overflow-hidden lg:flex-1 [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: domainModelInit}}
        />
      </div>

      <h3 className="mt-10 text-center">Designing With Constraints</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          Considering the Pi's limited resources, I ensured the queues handling 
          thread-safe data exchange were capped at 2,000 each. The typical 
          <em>Maximum Transmission Unit</em> (MTU) for TCP is 1,500 bytes 
          (Gargan, 2025). Therefore, the packet queue, which stores full packets 
          until feature extraction, will consume approximately 3MB of data at 
          maximum capacity. On the Raspberry Pi's 4GB of RAM, this is well 
          within acceptable limits, along with all other functions. The second 
          queue will consume even less volatile memory because the data stored is
          much smaller. These values can also be modified for a system with tighter 
          resource requirements. This is one of the parts I'm most proud of 
          architecturally. The number 2000 isn't a guess, it's the product of a 
          memory calculation against the Pi's actual hardware. The bounded queue 
          is the single line that enforces the whole budget:
        </p>
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <div key={'Packet Capture Bounded Queue'} className="max-w-full 
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: pcBoundedQueue}}
          />
          <p>
            And the matching feature queue cap in the <span className="text-blue-300 
            font-medium"> Traffic Analyzer</span> which feeds the inference engine:
          </p>
          <div key={'Traffic Analyzer Bounded Queue'} className="max-w-full
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: taBoundedQueue}}
          />
          <p>
            Because these queues are bounded, a traffic burst can never eat the 
            Pi's RAM. Packets will drop once the cap is hit, which means the rest 
            of the system keeps working. I chose to accept that some packets may be 
            missed during a spike. A better outcome than an out-of-memory crash that 
            takes the whole monitor offline.
          </p>
        </div>
      </div>

      <h3 className="mt-10 text-center">Guarding against hostile inputs</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          I do understand the limitations of using Python for such a network monitor 
          due to the runtime environment overhead, the Global Interpreter Lock 
          (GIL), and automatic memory management. However, this was a deliberate 
          design consideration given the time frame of the project and the 
          re-engineering required to implement a state machine in another language, 
          such as C++. A manual memory management language like C++ also introduces 
          several security concerns regarding buffer overflows and other memory 
          vulnerabilities, which increase overall time investment. To guard against 
          malformed packets, however unlikely for such an unremarkable residential 
          network as mine, selecting only packets with IP and TCP layers reduces the 
          attack surface during feature extraction. Additionally, null features and 
          NaN fields are caught before data is passed to the inference model.
        </p>
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            The first line of defense is a filter that drops anything that isn't 
            a TCP/IP packet before it ever reaches the analyzer 
          </p>
          <div key={'Packet CallBack'} className="max-w-full
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: packetCallBack}}
          />
        </div>
      </div>

      <div className="flex flex-col my-2 lg:flex-row lg:my-4 mx-0.5 justify-center
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          To guard against flow table exhaustion, the flow statistics dictionary is
          capped and evicts the 100 oldest entries when the limit is reached, preventing
          an adversary from filling the table and operating freely in untracked flows.
          The NaN guard runs at the same boundary. <code>np.std([])</code> on an empty
          packet list produces NaN, and a single NaN in the input tensor corrupts every
          neuron downstream. Both are addressed before any data reaches the interpreter:
        </p>
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <div key={'Flow Table Eviction'} className="max-w-full
            rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
              dangerouslySetInnerHTML={{__html: flowTableEviction}}
            />
          <div key={'NaN Catch'} className="max-w-full
            rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
              dangerouslySetInnerHTML={{__html: NaNCatch}}
            />
        </div>
      </div>

      <div className="flex flex-col my-2 lg:flex-row-reverse lg:my-4 mx-0.5 
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
            This enhancement allowed me to investigate the intricacies of the GIL 
            and how it affects threading in Python. I found David Beazley's slides 
            from his presentation at PyCon in 2010 to be highly informative in this
             area. The Python state machine design utilizes several implementations 
             that release the GIL, permitting other threads to operate during 
             blocking operations. The HTTP post and get calls release the GIL 
             during network I/O, meaning the capture and inference threads remain 
             free to run during the full duration of a server round trip. TFLite's 
             invoke call explicitly releases the GIL during inference, which is the
             most CPU-intensive operation in the pipeline. Scapy's sniff does hold 
             the GIL during packet processing, but because the monitor and alert 
             threads spend most of their time blocked on queue operations and 
             network I/O, respectively, contention is minimal.
        </p>
        <div key={'Inference Thread'} className="max-w-full lg:flex-1 min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: inferenceThread}}
          />
      </div>

      <h3 className="text-center mt-10">A Secure Path to the Backend</h3>
      <div className="flex flex-col my-2 lg:flex-row lg:my-4 mx-0.5 
      gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <p className="indent-10">
            For the secure API post method, I stored a shared key as an 
            environment variable for separation and will ensure the connection 
            is over HTTPS to protect the key in transit.
          </p>
          <div key={'Pi Environment'} className="max-w-full min-w-0 
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: piEnv}}
          />
          <p className="indent-10 mt-5">
            Before sending a batch of alerts, the alert thread first checks 
            the server is reachable with a heartbeat GET.
          </p>
          <div key={'Heartbeat'} className="max-w-full min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: heartBeat}}
          />
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            If the heartbeat fails, the batch is never sent. However, it's also 
            never lost, because the failure is logged to a local file. I 
            implemented the same function if the POST itself fails:
          </p>
          <div key={'POST'} className="max-w-full min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: localLog}}
          />
        </div>
      </div>

      <h3 className="text-center mt-10">Just Hanging Around</h3>
      <div className="flex flex-col my-2 lg:flex-row lg:my-4 mx-0.5 justify-center 
      gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            One detail I would like to give more attention to is the idle state 
            behavior. A traditional state machine would either spin in idle 
            (wasting CPU) or sleep for a fixed interval (wasting latency on a 
            quiet network). This implementation does neither. Instead, it performs 
            a single-packet blocking sniff. The first packet that arrives instantly 
            wakes the machine back into monitor mode and is put into the packet 
            queue so it isn't lost:
          </p>
          <div key={'Enter Idle'} className="max-w-full min-w-0
            rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
              dangerouslySetInnerHTML={{__html: enterIdle}}
            />
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            The monitor state itself transitions back to idle after two consecutive 
            empty-queue seconds. The machine smarlty transitions between idle and 
            monitor automatically based on network activity. It's a small piece of 
            control-flow design that I wanted to automate for efficiency.
          </p>
          <div key={'Monitor Thread'} className="max-w-full min-w-0
            rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
              dangerouslySetInnerHTML={{__html: monitorThread}}
            />
        </div>
      </div>

      <h3 className="text-center mt-10">Conclusions</h3>
      <div className="flex flex-col my-2 lg:flex-row lg:my-4 mx-0.5 justify-center
      gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            This enhancement shows my ability to design and evaluate a computing solution
            while managing the trade-offs involved in design choices. Every deliberate
            decision I made about queue sizing, flow-table management, and thread
            coordination was a trade-off between throughput, memory, and resilience on
            constrained hardware. I applied algorithmic principles and
            industry-standard practices to a real problem. Throughout the project I
            maintained a security mindset that anticipates adversarial exploits.
            The HTTPS-plus-bearer-token path between the Pi and the server, a bounded
            flow table that closes a denial-of-service hole in my own monitor, and the
            NaN and malformed-packet guards are all the product of thinking like an
            attacker.
          </p>
          <p className="indent-10">
            Deployment also surfaced a subtle but critical bug in the state machine class
            signature. The python-statemachine documentation shows a generic type parameter:{' '}
            <code>NetworkMonitorMachine(StateMachine[ 'NetworkMonitorModel'])</code>{' '}
            which looks reasonable on paper. At runtime, however, python-statemachine 3.x does not
            implement a true generic. The subscript is type-hint only. Python raised a
            <code>TypeError</code> the moment the class body was evaluated, before a single
            packet was ever seen. The fix was simply removing the subscript and writing{' '}
            <code>class NetworkMonitorMachine(StateMachine):</code>. It was a good reminder
            that type annotations and runtime behavior are not the same thing, and that
            reading library documentation is not a substitute for running the code.
          </p>
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10 lg:flex-1">
            The most significant structural lesson came from a threading mistake I made
            in the monitor loop. Initially I forgot to follow the controller-worker design
            pattern. I placed state-change logic inside <code>monitor_thread</code>, which
            called <code>machine.send('wait')</code> directly. Because <code>send()</code>
            is synchronous and immediately re-enters the state machine, it spawned a new
            <code>monitor_thread</code> before the old one returned, creating an infinite
            threading loop that crashed with <code>TransitionNotAllowed</code>. I
            remembered to keep controlling logic separate from working logic. I then created
            a <code>run()</code> method on the state machine itself so it can drive all
            state transitions. I made <code>NetworkMonitorModel</code> a supervisor that
            only delegates and coordinates work to the other classes. It signals readiness
            via a <code>threading.Event</code> and returns. The state machine's
            <code>run()</code> loop waits on that signal, then decides what to do next:
          </p>
          <div key={'SM Run'} className="max-w-full lg:flex-1 min-w-0
            rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
              dangerouslySetInnerHTML={{__html: smRun}}
            />
        </div>
      </div>
      <p className="indent-10">
        The biggest lesson for me was that "design" isn't something you do once at
        the start and walk away from. Every line in this file is a small design
        decision. The choice of queue size, the choice of when to drop a packet,
        the choice of which thread holds the GIL, the choice of what to do when
        the server is unreachable. All very valuable lessons when developing with
        embedded systems. Something I'm actually quite fond of.
      </p>

      <h3 className="text-center mt-10">Trial by Fire Updates</h3>
      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            After letting the monitor run against a tcpreplay loop for 24 hours, it had
            analyzed over 12,000 flows and posted zero alerts. That result needed explaining.
          </p>
          <p className="indent-10 lg:flex-1">
            The first problem was in flow tracking. The flow tracker discarded any flow that
            lacked a captured SYN handshake. With tcpreplay replaying a historical pcap,
            that's most flows. The fix assigns direction metadata to those flows instead
            of deleting them. The model doesn't need to know which side initiated the
            connection. It needs consistent feature values.
          </p>
        </div>
        <div key={'Mid-stream Assignment'} className="max-w-full lg:flex-1 min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: midStreamAssignment}}
        />
      </div>

      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            The second problem was quieter. When the queue is empty, the alert thread still
            posts an empty array to <code>/api/alerts</code>. <code>insertMany([])</code>
            returns 201 with no documents written. Railway showed clean 201s the entire time.
            The database was empty. This confirmed the real problem was upstream: flows
            weren't reaching inference.
          </p>
          <p className="indent-10 lg:flex-1">
            A third issue was connected to the first. The FIN threshold was{' '}
            <code>&gt;= 1</code>, extracting a flow the moment one side sent a FIN.
            Flows that never fully closed were going to inference with incomplete data.
            Raising the threshold to <code>&gt; 1</code> waits for both FINs. Flows
            that never close cleanly are handled by the stale sweep instead.
          </p>
        </div>
        <div key={'FIN Threshold'} className="min-w-0 w-fit max-w-full lg:flex-1 
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: finThreshold}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 mx-0.5  gap-2">
          <p className="indent-10">
            Not every flow accumulates 25 packets or reaches a clean FIN exchange. For
            those, I added an hourly cleanup pass to the{' '}
            <span className="text-blue-300 font-medium">Traffic Analyzer</span>. Flows
            inactive for more than an hour get their features extracted and queued for
            inference. They're then removed from the flow table. The sweep uses{' '}
            <code>packet.time</code> from the pcap, not the system clock. Replayed
            timestamps work correctly as a result.
          </p>
          <p className="indent-10">
            Every flow now has a path to inference: 25 or more packets, both FINs
            observed, or the stale sweep after an hour of inactivity. The monitor was
            architecturally sound. It just wasn't seeing most of its traffic.
          </p>
      </div>
      <div key={'Stale Flow Sweep'} className="max-w-full flex-1
        rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
        dangerouslySetInnerHTML={{__html: staleFlowSweep}}
      />
      </div>

      

      <h3 className="mt-10">References</h3>
      <p>Beazley, D. (2010). Understanding the Python GIL. dabeaz.com. <a target="_blank" href="https://dabeaz.com/python/UnderstandingGIL.pdf">https://dabeaz.com/python/UnderstandingGIL.pdf</a></p>
      <p>Gargan, R. (2025, January 16). What is MTU size? Effects on speed and network efficiency. Netmaker. <a target="_blank" href="https://www.netmaker.io/resources/mtu-size">https://www.netmaker.io/resources/mtu-size</a></p>
    </main>
  );
}