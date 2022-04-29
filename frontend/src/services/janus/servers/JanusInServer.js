import JanusServer from '@/services/janus/servers/JanusServer';

export default class JanusInServer extends JanusServer {
  constructor(janusService, config, type) {
    super(janusService, config, JanusServer.BASE_TYPE_IN, type);
  }
}