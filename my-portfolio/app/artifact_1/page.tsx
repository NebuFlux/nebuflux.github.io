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
  const NaNCatch = smCode['Traffic Analyzer']?.['NaN Catch']?.['content'];
  const inferenceThread = smCode['Inference Model']?.['Inference Thread']?.["content"];

  return (
    <main className="flex flex-col p-5  mx-auto w-full">

      <h1 className="text-center">
        Inspector Gadget State Machine
      </h1>

      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
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
            Interface (SPI).
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
          wired together in 
          <a className="inline-flex items-baseline text-teal-400 hover:underline 
          indent-0" 
          href="www.github.com/Nebuflux/ANN_modeling">NetworkMonitorModel.__init__
            <span className="translate-y-0.5">
              <SiGithub className="fill-teal-400 ml-2 mb-2" size={10}/>
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
          <p className="indent-10">
            The second line of defense sits at the boundary between feature 
            extraction and the model. np.std([]) returns NaN, and a single NaN in 
            the input tensor will corrupt every neuron downstream. This loop 
            catches them all before the tensor ever reaches the interpreter:
          </p>
          <div key={'NaN Catch'} className="max-w-full
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: NaNCatch}}
          />
        </div>
      </div>
      <div className="flex flex-col my-2 lg:flex-row lg:my-4 mx-0.5 justify-center 
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          To guard against flow table exhaustion, the flow statistics dictionary is 
          capped and evicts the 100 oldest entries when the limit is reached, preventing 
          an adversary from filling the table and operating freely in untracked flows.
        </p>
        <div key={'NaN Catch'} className="max-w-full lg:flex-1 min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: NaNCatch}}
          />
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
        <div key={''} className="max-w-full lg:flex-1 min-w-0
          rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: inferenceThread}}
          />
      </div>
    </main>
  );
}