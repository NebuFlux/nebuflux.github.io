import type { ArtifactData } from '../utility/ArtifactData';
import { getGadgetCode } from './smStaticProps';

export default async function Artifact_1() {

  const gadgetCode: ArtifactData = await getGadgetCode();

  const domainModelInit = gadgetCode['Network Domain Model']?.['Init']?.['content'];

  return (
    <main className="flex flex-col flex-1 p-5  mx-auto w-full">
      <h1 className="text-3xl text-center text-secondary">Inspector Gadget State Machine</h1>
      <div className="flex flex-col lg:flex-row my-2 mx-0.5 justify-center gap-2 w-full">
        <p className="text-l  text-left indent-10">
          The original artifact for this submission is a Python State Machine designed for a Raspberry Pi 4 embedded 
          system to simulate a smart thermostat as a proof of concept. This artifact shows an understanding of several 
          concepts important to embedded programming. While creating the smart thermostat, I explored the growing 
          field of the Internet of Things, safety and security concerns, as well as limitations of embedded smart 
          systems. Embedded architecture particularly piqued my interest, and I’m grateful to have the opportunity 
          to explore the concepts of Advanced RISC Machine (ARM) and System-on-Chip (SoC) architectures. I also 
          explored the intricacies of peripheral integration through serial communication protocols, such as the 
          Inter-Integrated Circuit (I2C), Universal Asynchronous Receiver/Transmitter (UART), and the Serial Peripheral 
          Interface (SPI).
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-l text-left indent-10">
            The enhancement for the Python State Machine drastically reconfigured the structure and purpose. 
            I increased the complexity of the State Machine by introducing a domain model in accordance with the 
            Python State Machine docs (v3.0). This domain model integrated 4 components: a network packet retriever, 
            a packet feature extractor, an inference model for traffic classification, and an alarm engine to forward 
            identified traffic to a web server. Each of these components, except the Traffic Analyzer, controls it's own thread and with threading event
            flags to stop processing. Here is the Init function for the Network Domain Model.
          </p>
          <div key={'__init__'} className="w-fit max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: domainModelInit}}
          />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row my-2 mx-0.5 justify-center gap-2 w-full">
        <p className="text-l text-left indent-10">
          This expanded the Python state machine to 3 states and 3 transitions. 
            This enhancement stages my growth in understanding architecture, design, and constraints of an embedded 
            system for edge deployment. 
        </p>
      </div>
    </main>
  );
}