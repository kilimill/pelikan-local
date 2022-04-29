import { EchoTestPlugin } from '@/services/janus/plugins/EchoTestPlugin';
import JanusInServer from '@/services/janus/servers/JanusInServer';
import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusInEchoServer extends JanusInServer{

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_ECHO);
  }

  loadPlugins() {
    this.plugin = new EchoTestPlugin(this);
  }
}