import { VideoRoomInDevicePlugin } from '@/services/janus/plugins/VideoRoomInDevicePlugin';
import JanusInServer from '@/services/janus/servers/JanusInServer';
import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusInDeviceServer extends JanusInServer{

  requestDevicesCompleted = false;

  constructor(janusService, config) {
    super(janusService, config, JanusServer.TYPE_DEVICE);
  }

  createJanusObject (janusService, config) {
    super.createJanusObject(janusService, config);
  }

  loadPlugins (reconnect = false, reconnectCallback = undefined) {
    this.attachJanusInVideoRoomDevicePlugin();
    this.loadPromiseResolve(reconnect, reconnectCallback);
  }

  attachJanusInVideoRoomDevicePlugin() {
    this.plugin = new VideoRoomInDevicePlugin(this);
    this.pluginsReadyPromiseArr.push(this.plugin.attachPromise);
  }
}