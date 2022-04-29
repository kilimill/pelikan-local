import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusOutServer extends JanusServer {

    constructor(janusService, config, type) {
      super(janusService, config, JanusServer.BASE_TYPE_OUT, type);
    }

  loadPlugins(reconnect = false, reconnectCallback = undefined) {
    this.attachJanusOutStreamingMainPlugins();
    this.loadPromiseResolve(reconnect, reconnectCallback);
  }
}