import serverApi from '@/api/server';
import {Janus} from 'janus-gateway';

export default class JanusServer{
  baseType;
  type;
  janusReconnectInterval;
  janus;
  janusService;

  serversListIndex = 0;
  serversList;

  janusReadyPromise;
  promiseResolve;
  promiseReject;

  plugin;
  pluginsReadyPromiseArr = [];
  trafficType;

  config;

  static TRAFFIC_TYPE_IP_CAM = "ipCam"
  static TRAFFIC_TYPE_WEB_CAM = "webCam"
  static TRAFFIC_TYPE_WEB_SCREEN = "webScreen"

  static BASE_TYPE_IN = "in";
  static BASE_TYPE_OUT = "out";

  static TYPE_ECHO = "echo";
  static TYPE_DEVICE = "device";
  static TYPE_SCREEN = "screen";
  static TYPE_PRIMARY = "primary";
  static TYPE_CALLED = "called";


  get currentRoom(){
    return this.janusService.currentRoom;
  }

  get currentUser(){
    return this.janusService.currentUser;
  }

  constructor(janusService, config, baseType, type) {
    this.janusService = janusService;
    this.config = config;
    this.baseType = baseType;
    this.type = type;

    this.setJanusReadyPromise();
    this.setupJanusServer(config).catch((err) => console.error(err))
  }

  setJanusReadyPromise(){
    this.promiseResolve = undefined;
    this.promiseReject = undefined;
    this.janusReadyPromise = new Promise((res, rej) => {
      this.promiseResolve = res;
      this.promiseReject = rej;
    });
  }

  switchListIndex(){
    if(this.serversListIndex < this.serversList.length - 1){
      this.serversListIndex++;
    }else{
      this.serversListIndex = 0;
    }
  }

  async setupJanusServer(config, isReconnecting = false){
    this.trafficType = config.trafficType;
    await this.getJanusServer(this.trafficType).then(res => {
      this.serversList = [res.data];
      this.setPath();
      this.createJanusObject(config, isReconnecting);
    })
  }

  getJanusServer (trafficType) {
    let response;
    if (this.baseType === JanusServer.BASE_TYPE_IN) {
      response = serverApi.getJanusInServer(trafficType);
    }
    if (this.baseType === JanusServer.BASE_TYPE_OUT) {
      response = serverApi.getJanusOutServer(trafficType);
    }
    return response;
  }

  setPath(){
    this.domain = this.serversList[this.serversListIndex].domain;
    this.path = `https://${this.domain}/janus`;
  }

  createJanusObject(config, reconnect = false) {
    if (this.janus !== undefined) {
      return false;
    }
    clearInterval(this.janusReconnectInterval);
    this.janus = new Janus({
      server: this.path,
      iceServers: this.setICEServers([this.domain]),
      success: () => this.loadPlugins(reconnect, config.reconnectCallback),
      error: (err) => {
        console.error(err);
        this.reconnectHandler(config);
      },
    });
  }
  setICEServers(ipArr){
    let stunServers = [];
    let turnServers = [];

    ipArr.forEach(ip => {
      stunServers.push(`stun:${ip}:443`);
      turnServers.push(`turn:${ip}:443?transport=tcp`);
    });

    return [
      {
        urls: stunServers,
      },
      {
        urls: turnServers,
        credential: 'Iunae8gee4',
        username: 'turnuser',
      },
    ];
  }

  reconnectHandler(config){
    if (!this.currentRoom.isFinished) {
      clearInterval(this.janusReconnectInterval);
      this.janusReconnectInterval = setInterval(() => {
        this.janusService.destroyJanus(this.baseType, this.type);
        this.janus = undefined;

        this.pluginsReadyPromiseArr = [];
        this.setJanusReadyPromise();
        clearInterval(this.janusReconnectInterval);
        this.setupJanusServer(config, true).catch(() => this.reconnectHandler(config));
        console.error('janus reconnect callback');
      }, 3000);
    }
  }

  handleError (error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  loadPromiseResolve(reconnect, reconnectCallback){
    Promise.all(this.pluginsReadyPromiseArr).then(() => {
      if(reconnect && reconnectCallback !== undefined){
        reconnectCallback();
      }
      this.promiseResolve();
    }).catch((err) => {
      console.error(`${this.constructor.name} plugins attach error!`, err);
    });
  }
}