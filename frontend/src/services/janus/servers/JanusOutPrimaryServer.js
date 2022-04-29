import {
  StreamingOutMainPlugin,
} from '@/services/janus/plugins/StreamingOutMainPlugin';
import JanusServer from '@/services/janus/servers/JanusServer';
import JanusOutServer from '@/services/janus/servers/JanusOutServer';

export default class JanusOutPrimaryServer extends JanusOutServer {

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_PRIMARY);
  }

  attachJanusOutStreamingMainPlugins() {
    this.plugin = new StreamingOutMainPlugin(this);
    this.pluginsReadyPromiseArr.push(this.plugin.attachPromise);
  }
}