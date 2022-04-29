import {Janus} from 'janus-gateway';
import { MountPoint } from '@/services/janus/MountPoint';
import { Room } from '@/services/janus/Room';
import { User } from '@/services/janus/User';
import JanusServer from '@/services/janus/servers/JanusServer';
import JanusInEchoServer from '@/services/janus/servers/JanusInEchoServer';
import JanusInDeviceServer from '@/services/janus/servers/JanusInDeviceServer';
import JanusInScreenServer from '@/services/janus/servers/JanusInScreenServer';
import JanusOutPrimaryServer from '@/services/janus/servers/JanusOutPrimaryServer';
import JanusOutCalledServer from '@/services/janus/servers/JanusOutCalledServer';
import JanusOutScreenServer from '@/services/janus/servers/JanusOutScreenServer';

export default new class JanusService{

  players = {
    main: undefined,
    secondary: undefined,
    video: undefined,
    screen: undefined,
    echo: undefined,
  };

  micElement;

  mountPoints;
  constants;

  config = {
    ICEServerIP: undefined,
  };

  janus = {
    in: {
      echo: undefined,
      device: undefined,
      screen: undefined,
    },
    out: {
      primary: undefined,
      called: undefined,
      screen: undefined,
    },
    promisesArr: []
  };

  callbacks = {
    currentUser: undefined,
    currentRoom: undefined,
    participantReadyCallback: undefined
  };

  destroyJanus(baseType, type){
    if(this.janus[baseType][type] !== undefined && this.janus[baseType][type].janus !== undefined){
      this.janus[baseType][type].plugin?.handle?.detach();
      this.janus[baseType][type].janus.destroy();
    }
  }

  destroyAllJanusServers(){
    let baseTypes = [JanusServer.BASE_TYPE_IN, JanusServer.BASE_TYPE_OUT];

    for (const baseType of baseTypes) {
      for (const type in this.janus[baseType]) {
        this.destroyJanus(baseType, type);
      }
    }
  }

  configure(config){
      if(config.mountPoints){
        this.mountPoints = config.mountPoints;
      }

      if(config.constants) {
        this.constants = config.constants;
      }

      //TODO for debugging purposes, remove this, when all is done
      window.janusService = this;
  }

  get currentRoom(){
      return new Room(this.callbacks.currentRoom());
  }

  get currentUser(){
    return new User(this.callbacks.currentUser());
  }

  setCallbacks(callbacks){
    if (callbacks.currentRoom !== undefined){
      this.callbacks.currentRoom = callbacks.currentRoom;
    }
    if (callbacks.currentUser !== undefined){
      this.callbacks.currentUser = callbacks.currentUser;
    }
  }

  setParticipantReadyCallback(callback){
    this.callbacks.participantReadyCallback = callback;
  }

  setPlayer(type, ref) {
    this.players[type] = ref;
  }

  unsetPlayer(type) {
    this.players[type] = undefined;
  }

  createEchoTestOffer(stream){
    if(this.janus.in.echo !== undefined){
      this.janus.in.echo.plugin.createEchoTestOffer(stream);
    }
  }

  initEchoTestJanus (successCallback) {
    let config = {
      successCallback: successCallback,
      trafficType: JanusServer.TRAFFIC_TYPE_WEB_CAM
    };
    Janus.init({
      debug: false, callback: () => {
        this.janus.in.echo = this.createJanusInEchoServer(this, config);
      }
    });
  }

  createJanusInEchoServer(janusService, config){
    return new JanusInEchoServer(this, config)
  }

  createJanusInDeviceServer(janusService, config){
    return new JanusInDeviceServer(this, config)
  }

  createJanusInScreenServer(janusService, config){
    return new JanusInScreenServer(this, config)
  }

  createJanusOutPrimaryServer(janusService, config){
    return new JanusOutPrimaryServer(this, config)
  }

  createJanusOutCalledServer(janusService, config){
    return new JanusOutCalledServer(this, config)
  }

  createJanusOutScreenServer(janusService, config){
    return new JanusOutScreenServer(this, config)
  }

  watchScreenCaptureVideo(player){
    if(this.janus.out?.screen?.plugin){
      this.janus.out.screen.plugin.setPlayer(player);
      this.janus.out.screen.plugin.requestSwitchStream();
    }
  }

  forwardDeviceStream(type){
    this.janus.in?.device?.plugin?.forwardStreamToJanusOutServers(type);
  }

  forwardScreenStream(){
    this.janus.in.screen?.plugin?.forwardStreamToJanusOutServers(MountPoint.TYPE_HOST_SCREEN);
  }

  initJanus(callback){
      Janus.init({
        debug: false,
        callback: callback
      });
  }

  async initJanusInDevice(reconnectCallback){
    return new Promise((resolve, reject) => {
      let config = {
        reconnectCallback: reconnectCallback,
        trafficType: JanusServer.TRAFFIC_TYPE_WEB_CAM
      };

      this.setJanusInDeviceServer(config);

      return this.janus.in.device.janusReadyPromise.then(() => {
        resolve(true);
      }).catch((err) => {
        reject(false);
        console.error('in reject', err);
      });
    })
  }

  async initJanusInScreen(reconnectCallback){
    return new Promise((resolve, reject) => {
      let config = {
        reconnectCallback: reconnectCallback,
        trafficType: JanusServer.TRAFFIC_TYPE_WEB_SCREEN
      };

      this.setJanusInScreenServer(config);

      return this.janus.in.screen.janusReadyPromise.then(() => {
        resolve(true);
      }).catch((err) => {
        reject(false);
        console.error('screen reject', err);
      });
    })
  }

  async initJanusOutPrimary(reconnectCallback){
    return new Promise((resolve, reject) => {
      let config = {
        reconnectCallback: reconnectCallback,
        trafficType: this.currentRoom.isIpCamRoom ?
          JanusServer.TRAFFIC_TYPE_IP_CAM : JanusServer.TRAFFIC_TYPE_WEB_CAM
      };
      this.setJanusOutPrimaryServer(config);

      return this.janus.out.primary.janusReadyPromise.then(() => {
        resolve(true);
      }).catch((err) => {
        reject(false);
        console.error('out reject', err);
      });
    })
  }
  async initJanusOutCalled(reconnectCallback){
    return new Promise((resolve, reject) => {
      let config = {
        reconnectCallback: reconnectCallback,
        trafficType: JanusServer.TRAFFIC_TYPE_WEB_CAM
      };
      this.setJanusOutCalledServer(config);

      return this.janus.out.called.janusReadyPromise.then(() => {
        resolve(true);
      }).catch((err) => {
        reject(false);
        console.error('out reject', err);
      });
    })
  }
  async initJanusOutScreen(reconnectCallback){
    return new Promise((resolve, reject) => {
      let config = {
        reconnectCallback: reconnectCallback,
        trafficType: JanusServer.TRAFFIC_TYPE_WEB_SCREEN
      };
      this.setJanusOutScreenServer(config);

      return this.janus.out.screen.janusReadyPromise.then(() => {
        resolve(true);
      }).catch((err) => {
        reject(false);
        console.error('out reject', err);
      });
    })
  }

  switchStream(triggerSecondary = false, localId = null) {
    let id;
    if(localId !== null){
      id = localId;
    }else{
      id = this.currentRoom.setting('activeMountPointId')
    }

    let server = MountPoint.getServerType(
      this.currentRoom.isWebCamRoom,
      this.mountPoints,
      id
  );
    if(this.janus.out[server]?.plugin){
      this.janus.out[server].plugin.requestSwitchStream(id, false);
    }

    if(triggerSecondary){
      this.switchSecondaryPlayer(id);
    }
  }

  getSecondaryMountPointId (mountPointId) {
    let result;
    if (this.currentRoom.isIpCamRoom) {
      if (MountPoint.isIpMountpoint(
        this.mountPoints,
        mountPointId,
      )) {
        result = this.mountPoints.web.called.id;
      } else {
        for (const id in this.currentRoom.streams) {
          if (this.currentRoom.streams[id] !== undefined) {
            if (this.currentRoom.streams[id].status_id === 2) {
              result = this.currentRoom.streams[id].mountpoint_id;
              break;
            }
          }

        }
        if (!result) {
          result = this.mountPoints.ip[0];
        }
      }
    }

    if (this.currentRoom.isWebCamRoom) {
      if (MountPoint.isCalledUserMountPoint(
        this.mountPoints,
        mountPointId,
      )) {
        result = this.mountPoints.web.host.id;
      }
      if (MountPoint.isHostDeviceMountPoint(
        this.mountPoints,
        mountPointId,
      )) {
        result = this.mountPoints.web.called.id;
      }
      if (MountPoint.isHostScreenCaptureMountPoint(
        this.mountPoints,
        mountPointId,
      )) {
        result = this.mountPoints.web.called.id;
      }
    }

    return result;
  }

  switchSecondaryPlayer(mountPointId){
    let secondaryMountPointId = this.getSecondaryMountPointId(mountPointId);

    let server = MountPoint.getServerType(
      this.currentRoom.isWebCamRoom,
      this.mountPoints,
      secondaryMountPointId
    );
    if(this.janus.out[server]?.plugin){
      this.janus.out[server].plugin.requestSwitchStream(
        secondaryMountPointId, true
      );
    }
  }

  publishOwnStream (stream) {
    this.stopDeviceCapture();
    this.janus.in.device?.plugin?.startRecordingProcess(
      stream,
      false
    );
  }

  updateStream(stream){
    if(this.janus.in.device.plugin !== undefined){
      this.janus.in.device.plugin.updateStream(stream);
    }
  }

  setJanusInDeviceServer(config) {
    this.janus.in.device = this.createJanusInDeviceServer(this, config);
    this.janus.promisesArr.push(this.janus.in.device.janusReadyPromise);
  }
  setJanusInScreenServer(config) {
    this.janus.in.screen = this.createJanusInScreenServer(this, config);
    this.janus.promisesArr.push(this.janus.in.screen.janusReadyPromise);
  }
  setJanusOutPrimaryServer(config) {
    this.janus.out.primary = this.createJanusOutPrimaryServer(this, config);
    this.janus.promisesArr.push(this.janus.out.primary.janusReadyPromise);
  }
  setJanusOutCalledServer(config) {
    this.janus.out.called = this.createJanusOutCalledServer(this, config);
    this.janus.promisesArr.push(this.janus.out.called.janusReadyPromise);
  }
  setJanusOutScreenServer(config) {
    this.janus.out.screen = this.createJanusOutScreenServer(this, config);
    this.janus.promisesArr.push(this.janus.out.screen.janusReadyPromise);
  }

  publishScreenCapture (stream){
    this.janus.in.screen.plugin.startRecordingProcess(stream, true);
  }


  roomAudioOn(){
    if(this.janus.out?.primary?.plugin?.handle){
      this.janus.out.primary.plugin.sendMessage({
        request: "configure",
        audio: true
      });
    }
  }
  roomAudioOff(){
    if(this.janus.out?.primary?.plugin?.handle){
      this.janus.out.primary.plugin.sendMessage({
        request: "configure",
        audio: false
      });
    }
  }
  stopScreenCapture() {
    if(this.janus.in.screen?.plugin?.handle?.webrtcStuff?.iceDone){
      this.janus.in.screen.plugin.stopMedia();
      this.janus.in.screen.plugin.stopLocalTracks();
    }
  }

  stopDeviceCapture(){
    if(this.janus.in.device?.plugin?.handle?.webrtcStuff?.iceDone){
      this.janus.in.device.plugin.stopMedia();
      this.janus.in.device.plugin.stopLocalTracks();
    }
  }

  stopAllMedia(){
    this.stopScreenCapture();
    this.stopDeviceCapture();
    this.clearPlayers();
  }

  stopLocalTracks(){
    this.janus.in?.device?.plugin?.stopLocalTracks();
    this.janus.in?.screen?.plugin?.stopLocalTracks();
  }

  clearPlayers(){
    this.clearMainPlayer();
    this.clearSecondaryPlayer();
    this.clearScreenPlayer();
  }

  clearMainPlayer (){
    Janus.attachMediaStream(
      this.players.main,
      null
    );
  }
  clearSecondaryPlayer(){
    Janus.attachMediaStream(
      this.players.secondary,
      null
    );
  }

  clearScreenPlayer(){
    Janus.attachMediaStream(
      this.players.screen,
      null
    );
  }

  afterDropUserCallHandler(){
    if (this.janus.out.called?.plugin){
      this.janus.out.called.plugin.sendMessage({
        request: "stop"
      });
      this.janus.out.called.plugin.watchRequest.done = false;
      this.janus.out.called.plugin.lastRequestedId = undefined;

      this.clearSecondaryPlayer();
      if(this.janus.out.called.plugin.webrtcStuff){
        Janus.stopAllTracks(this.janus.out.called.plugin.webrtcStuff.remoteStream);
      }
    }
  }
}