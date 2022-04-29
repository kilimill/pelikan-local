import { VideoRoomInScreenPlugin } from '@/services/janus/plugins/VideoRoomInScreenPlugin';
import JanusInServer from '@/services/janus/servers/JanusInServer';
import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusInScreenServer extends JanusInServer{

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_SCREEN);
  }

  loadPlugins(reconnect = false, reconnectCallback = undefined) {
    this.attachJanusInVideoRoomScreenPlugin();
    this.loadPromiseResolve(reconnect, reconnectCallback);
  }

  attachJanusInVideoRoomScreenPlugin() {
    this.plugin = new VideoRoomInScreenPlugin(this);
    this.pluginsReadyPromiseArr.push(this.plugin.attachPromise);
  }
}