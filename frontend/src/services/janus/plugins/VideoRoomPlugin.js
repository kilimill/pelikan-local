import { MountPoint } from '@/services/janus/MountPoint';
import roomApi from "@/api/room";
import userApi from '@/api/user';
import { Plugin } from '@/services/janus/plugins/Plugin';
import {Janus} from 'janus-gateway';

export class VideoRoomPlugin extends Plugin {
  constructor(janus) {
    super(janus, Plugin.TYPE_VIDEOROOM);
  }

  joinVideoRoom() {
    let join = {
      request: "join",
      room: this.currentRoom.id,
      ptype: "publisher",
      close_pc: false,
      pin: this.currentRoom.janusPin,
      display: this.getMountPointTypeIdForDisplay().toString()
    };

    this.sendMessage(join);
  }

  messageCallbackEventJoined(msg) {
    super.messageCallbackEventJoined(msg);
    this.handle['feedId'] = msg["id"];
    Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.handle.id);

    this.handle.pluginIsReady = true;
  }

  messageCallbackJsep(jsep) {
    super.messageCallbackJsep(jsep);

    this.handle.myFeedPublished = true;

    Janus.debug('jsep publish');
    this.handle.handleRemoteJsep({jsep: jsep});
  }

  getMediaParams () {
    let media;
    media = {
      audioRecv: false,
      videoRecv: false,
      audioSend: true,
      videoSend: true,
      replaceAudio: true,
      replaceVideo: true
    };

    return media;
  }

  startRecordingProcess(stream, screenCapture, bitrate){
    let media = this.getMediaParams();

    if(screenCapture){
      media.video = "screen";
    }

    roomApi.getWebcamFilename(screenCapture).then((response) => {
      let filename = response.data.trim();
      if (media !== null) {
        this.handle.createOffer(
          {
            media: media,	// Publishers are sendonly
            stream: stream,
            success: (jsep) => {
              Janus.debug("Got publisher SDP!");
              Janus.debug(jsep);
              this.startRecording(screenCapture, filename, jsep, bitrate);
            },
            error: function (error) {
              Janus.error("WebRTC error:", error);
            }
          });
      } else {
        this.startRecording(screenCapture, filename, null, bitrate);
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  startRecording(screenCapture, filename, jsep = null, bitrate = Plugin.BITRATE_WEBCAM) {
    if (filename !== undefined) {
      Janus.debug(`startRecording ${bitrate}`);
      let configure = {
        request: "configure",
        keyframe: true,
        audio: true,
        video: true,
        bitrate: bitrate,
        record: true,
        filename: filename,
        pin: this.currentRoom.janusPin,
      };
      Janus.debug(configure);
      this.handle.send({"message": configure, "jsep": jsep});
    }
  }

  stopRecording() {
    this.sendMessage({
      request: "configure",
      record: false,
      pin: this.currentRoom.janusPin
    });
  }

  forwardStreamToJanusOutServers(typeId){
    let prop = "device";
    if (typeId === MountPoint.TYPE_HOST_SCREEN){
      prop = "screen";
    }
    for (const janusServer of this.janusService.janus.in[prop].serversList) {
      userApi.broadcastStream(janusServer.id, this.currentRoom.id, typeId, this.handle.feedId);
    }
  }

  stopMedia(){
    this.sendMessage({
      request: "configure",
      record: false,
      video: false,
      audio: false
    });
  }

  stopLocalTracks(){
    if(this.handle.webrtcStuff?.myStream){
      let tracks = this.handle.webrtcStuff.myStream.getTracks();
      tracks.forEach(function(track) {
        track.stop();
      });
    }
  }
}