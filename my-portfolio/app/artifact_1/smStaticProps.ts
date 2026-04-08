import { GetStaticProps } from 'next';
import { ArtifactData} from '../utility/ArtifactData';
import { codeToHtml } from 'shiki';

export const getGadgetCode = async(): Promise<ArtifactData> => {

    const highlight = async (code: string) =>{
        return await codeToHtml(code, {
            lang: 'python',
            theme: 'ayu-dark'
        })
    }

    const inspectorGadgetCode: ArtifactData = {
        'Network Domain Model': {
            'Init': {
                "content": "def __init__(self, interface, model_file):\n"+
                            "\tself.model_file = model_file\n" +
                            "\tself.packet_capture = PacketCapture()\n" +
                            "\tself.traffic_analyzer = TrafficAnalyzer()\n" +
                            "\tself.inference_engine = Inference_Model(self.model_file)\n"+
                            "\tself.alert_system = Alert_System()\n" +
                            "\tself.monitoring_event = threading.Event()"
            },
            "Start":{
                "content":"print(f'Now Monitoring the network on interface: {self.interface}')\n" +
                        "self.monitoring_event.clear()\n"+
                        "self.monitor_thread = threading.Thread(target=monitor_thread)\n" + 
                        "self.monitor_thread.start()",
                "Monitor Thread":" def monitor_thread():\n" +
                                "\tself.packet_capture.start_capture(self.interface)\n" +
                                "\tself.inference_engine.start_inference(self.traffic_analyzer.feature_queue)\n" +
                                "\tself.alert_system.send_alerts(self.inference_engine.alert_queue)\n" +
                                "\tcount = 0\n"+
            "                   \twhile not self.monitoring_event.is_set():\n" +
                                "\t\ttry:\n"+
                                "\t\t\tpacket = self.packet_capture.packet_queue.get(timeout=1)\n"+
                                "\t\t\tcount = 0\n"+
                                "\t\t\tself.traffic_analyzer.analyze_packet(packet)\n"+
                                "\t\texcept queue.Empty:\n"+
                                "\t\t\tcount += 1\n"+
                                "\t\t\tif count > 1: machine.send('wait')\n"+
                                "\t\t\tcontinue\n"+
                                "\t\tself.packet_capture.stop()"
            },
            "Add Packet":{
                "content":"def add_packet(self, packet):\n"+
                        "\tself.packet_capture.packet_queue.put(packet)"
            },
            "Stop":{
                "content":"def stop(self):\n"+
                        "\tself.monitoring_event.set()\n"+
                        "\tif self.packet_capture.capture_thread.is_alive(): self.packet_capture.stop()\n"+
                        "\tif self.inference_engine.inference_thread.is_alive(): self.inference_engine.stop()\n"+
                        "\tif self.alert_system.alert_thread.is_alive(): self.alert_system.stop()"
            }
        },
        'State Machine': {
            "Definition": {
                "content": "class NetworkMonitorMachine(StateMachine['NetworkMonitorModel']):\n"+
                        "\tidle = State(initial=True)\n"+
                        "\tmonitor = State()\n"+
                        "\thibernate = State(final=True)\n"+
                        "\tstart = idle.to(monitor)\n"+
                        "\twait = monitor.to(idle)\n"+
                        "\tstop = idle.to(hibernate) | monitor.to(hibernate)\n"
            },
            "Enter Idle": {
                "content":"def on_enter_idle(self):\n"+
                        "\tsniffer = AsyncSniffer(iface = self.model.interface, count = 1)\n"+
                        "\tsniffer.start()\n"+
                        "\tsniffer.join()\n"+
                        "\tfor result in sniffer.results:\n"+
                        "\tself.model.add_packet(result)\n"+
                        "\tself.send('start')"
            },
            "Enter Monitor":{
                "content":"def on_enter_monitor(self):\n"+
                        "\tself.model.start(self)"
            },
            "Enter Hibernate":{
                "content":"def on_enter_hibernate(self):\n"+
                "self.model.stop()"
            }
        },
        "Main":{
            "Definition":{
                "startup":"if __name__ == '__main__':\n"+
                        "\tinterface = sys.argv[1] if len(sys.argv) > 1 else 'eth0'\n"+
                        "\tmodel_file = sys.argv[2] if len(sys.argv) > 2 else 'Inspector_Gadget_quant.tflite'\n"+
                        "\tnetwork_model = NetworkMonitorModel(interface, model_file)",
                "try catch":"try:\n"+
                            "\tnmm = NetworkMonitorMachine(network_model)\n"+
                            "\twhile nmm.current_state != nmm.hibernate:\n"+
                            "\t\tsleep(1)\n"+
                             "except KeyboardInterrupt:\n"+
                            "\tprint('Cleaning up. Exiting...')\n"+
                            "\tnmm.send('stop')\n"+
                            "\tsleep(2)"
            }
        }
    }

    for(const className in inspectorGadgetCode){
        for (const functionName in inspectorGadgetCode[className]){
            for (const contentSection in inspectorGadgetCode[className][functionName]){
                const code = inspectorGadgetCode[className][functionName][contentSection];
                inspectorGadgetCode[className][functionName][contentSection] = await highlight(code);
            }
        }
    }

    return inspectorGadgetCode;
}