import {
  StreamingOutScreenCapturePlugin,
} from '@/services/janus/plugins/StreamingOutScreenCapturePlugin';
import JanusOutServer from '@/services/janus/servers/JanusOutServer';
import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusOutScreenServer extends JanusOutServer {

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_SCREEN);
  }

  attachJanusOutStreamingMainPlugins() {
      this.plugin = new StreamingOutScreenCapturePlugin(this);
      this.pluginsReadyPromiseArr.push(this.plugin.attachPromise);
  }
}