import { StreamingPlugin } from '@/services/janus/plugins/StreamingPlugin';
import {Janus} from 'janus-gateway';

export class StreamingOutScreenCapturePlugin extends StreamingPlugin{

  constructor(janus) {
    super(janus, StreamingPlugin.TYPE_STREAMING);
    this.mountPointId
      = this.janusService.mountPoints.web.screen.id;
    this.player = this.janusService.players.screen;
  }

  requestSwitchStream(){
    this.watchOrSwitchStream();
  }

  watchOrSwitchStream(){
    let body;

    if (!this.handle.webrtcStuff.iceDone) {
      body = {
        "request": "watch",
        offer_audio: false,
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

  messageCallbackEventSwitched() {
    Janus.attachMediaStream(
      this.player,
      this.handle.webrtcStuff.remoteStream
    );
  }

  attachCallbackOnRemoteStream() {

    if (!this.currentRoom.isActive) {
      return;
    }
    if(this.janusService.janus.out?.screen){
      Janus.attachMediaStream(
        this.janusService.players.screen,
        this.janusService.janus.out.screen.plugin.handle.webrtcStuff.remoteStream
      );
    }

    if(this.player !== undefined && this.player.muted){
      this.player.muted = false;
    }
  }
}