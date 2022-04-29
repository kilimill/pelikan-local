import { Plugin } from '@/services/janus/plugins/Plugin';
import {Janus} from 'janus-gateway';

export class StreamingPlugin extends Plugin {

  mountPointId;

  watchRequest = {
    promise: undefined,
    resolve: undefined,
    reject: undefined,
    done: false
  };

  constructor(janus) {
    super(janus, Plugin.TYPE_STREAMING);

    this.watchRequest.promise = new Promise((res, rej) => {
      this.watchRequest.resolve = res;
      this.watchRequest.reject = rej;
    });
  }

  messageCallbackJsep(jsep) {
    super.messageCallbackJsep(jsep);

    let iceDone = this.handle.webrtcStuff.iceDone;

    if(iceDone){
      return;
    }

    Janus.debug('jsep listen');

    let media = {
      audioRecv: true,
      videoRecv: true,
      audioSend: false,
      videoSend: false,
      audio: true,
      video: true
    };

    this.handle.createAnswer({
      jsep: jsep,
      media: media,
      success: (jsep) => {
        let body = {
          "request": "start",
          "room": this.currentRoom.id,
          // "pin": janus_room_pin
        };
        this.handle.send({
          "message": body,
          "jsep": jsep,
        });
      },
      error: function (error) {
        Janus.error("WebRTC error:", error);
      }
    });
  }

  attachCallbackOnRemoteStream(stream, event){
    if(event && event.type === 'mute'){
      return;
    }
    super.attachCallbackOnRemoteStream(stream, this.player);
  }
}