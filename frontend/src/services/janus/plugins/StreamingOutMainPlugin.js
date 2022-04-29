import { MountPoint } from '@/services/janus/MountPoint';
import { StreamingPlugin } from '@/services/janus/plugins/StreamingPlugin';
import {Janus} from 'janus-gateway';
import janusService from '@/services/janus'

export class StreamingOutMainPlugin extends StreamingPlugin {

  constructor(janus) {
    super(janus, StreamingPlugin.TYPE_STREAMING);
  }

  requestSwitchStream(mountPointId,secondaryPlayer = false){
    this.mountPointId = mountPointId;
    this.player = !secondaryPlayer ? this.janusService.players.main : this.janusService.players.secondary;
    if(this.watchRequest.done && (this.lastRequestedId === this.mountPointId)){
      let server = MountPoint.getServerType(
        this.currentRoom.isWebCamRoom,
        this.janusService.mountPoints,
        this.mountPointId
      );
      let remoteStream = this.janusService.janus.out[server].plugin.handle.webrtcStuff.remoteStream;
      Janus.attachMediaStream(
        this.player,
        remoteStream
      );
      if(this.player){
        this.player.muted = false;
      }

      if(
        janusService.players['video'] !== undefined &&
        remoteStream &&
        remoteStream.getVideoTracks().length > 0 &&
        !secondaryPlayer
      ){
        janusService.players['video'].srcObject = undefined;
        Janus.attachMediaStream(
          janusService.players['video'],
          remoteStream
        );
      }
      this.configureMedia(secondaryPlayer);
    }else{
      this.watchOrSwitchStream();
      if(this.watchRequest.promise !== undefined && !this.watchRequest.done){
        this.watchRequest.promise.then(() => {
          this.configureMedia(secondaryPlayer);
        });
      }else{
        this.configureMedia(secondaryPlayer);
      }
    }
  }

  configureMedia (secondaryPlayer) {
    let audio;
    if (
      MountPoint.isCalledUserMountPoint(
        this.janusService.mountPoints,
        this.mountPointId,
      )) {
      audio = !(this.currentUser.isParticipant && this.currentUser.isCalled)
    } else {
      if(this.currentRoom.isWebCamRoom){
        audio = !this.currentUser.isHost;
      }
      if(this.currentRoom.isIpCamRoom){
        audio = !this.currentUser.isHost && this.currentRoom.setting('typeIpAudioOn');
      }
    }

    this.sendMessage({
      'request': 'configure',
      'audio': audio,
      'video': !secondaryPlayer,
    });
  }

  watchOrSwitchStream(){
    let body;

    if(this.handle === undefined){
      return;
    }

    if (this.handle && !this.handle.webrtcStuff.iceDone) {
      body = {
        "request": "watch",
        offer_audio: true,
        offer_video: true,
      };
    } else {
      body = {
        "request": "switch",
      };
    }

    body['id'] = this.mountPointId;
    body['pin'] = this.currentRoom.janusPin;
    this.lastRequestedId = body['id'];

    this.sendMessage(body);
  }

  attachCallbackSuccess(pluginHandle) {
    super.attachCallbackSuccess(pluginHandle);
  }

  messageCallbackEventSwitched(msg){
    super.messageCallbackEventSwitched(msg);
  }

  attachCallbackOnMessage (msg, jsep) {
    super.attachCallbackOnMessage(msg, jsep)
    if(
      msg['streaming'] === 'event' &&
      msg.result &&
      msg.result.status === 'preparing' &&
      !this.watchRequest.done
    ){
      this.watchRequest.resolve();
      this.watchRequest.done = true;
      this.watchRequest.promise = undefined;
    }
  }
}