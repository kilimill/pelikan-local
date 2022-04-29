import {
  StreamingOutMainPlugin,
} from '@/services/janus/plugins/StreamingOutMainPlugin';
import JanusOutServer from '@/services/janus/servers/JanusOutServer';
import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusOutCalledServer extends JanusOutServer {

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_CALLED);
  }

  attachJanusOutStreamingMainPlugins() {
    this.plugin = new StreamingOutMainPlugin(this);
    this.pluginsReadyPromiseArr.push(this.plugin.attachPromise);
  }
}