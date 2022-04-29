import {Janus} from 'janus-gateway';
import { Plugin } from '@/services/janus/plugins/Plugin';

export class EchoTestPlugin extends Plugin {

  audioMicStuff = {
    canvasContext: undefined,
    audioContext: undefined,
    analyser: undefined,
    microphone: undefined,
    javascriptNode: undefined
  }

  constructor (janus) {
    super(janus, Plugin.TYPE_ECHOTEST);
    this.player = janus.janusService.players.echo;
  }

  attachCallbackSuccess (pluginHandle) {
    this.handle = pluginHandle;

    this.janus.config.successCallback();
  }

  attachCallbackOnMessage (msg, jsep) {
    Janus.debug(msg);
    Janus.debug(jsep);
    if (jsep !== undefined && jsep !== null) {
      Janus.debug("Handling SDP as well...");
      Janus.debug(jsep);
      this.handle.handleRemoteJsep({ jsep: jsep });
    }
    if (msg['result'] && msg['result'] === 'ok') {
      Janus.attachMediaStream(
        this.player,
        this.handle.webrtcStuff.remoteStream
      );
    }
  }

  attachCallbackOnRemoteStream (stream) {
    Janus.attachMediaStream(this.player, stream);

    setTimeout(() => {
      this.handle.send({
        "message": {
          "request": "configure",
          "bitrate": 128000
        }
      });
    }, 1000);
  }

  attachCallbackError (error) {
    Janus.error(error);
  }

  createEchoTestOffer (stream) {
    this.handle.createOffer({
      media: {
        replaceAudio: true,
        replaceVideo: true,
        update: false,
      },
      stream: stream,
      success: (jsep) => {
        this.handle.send({
          'message': {
            'request': 'configure',
            'bitrate': 128000,
          },
          'jsep': jsep,
        });

      },
      error: (error) => {
        Janus.error('WebRTC error:', error);
      },
    });
  }
}