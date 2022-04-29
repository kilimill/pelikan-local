import { MountPoint } from '@/services/janus/MountPoint';
import { VideoRoomPlugin } from '@/services/janus/plugins/VideoRoomPlugin';
import { Plugin } from '@/services/janus/plugins/Plugin';

export class VideoRoomInDevicePlugin extends VideoRoomPlugin {

  audioGainNode;
  micLevelTimeout;

  audioMicStuff = {
    canvasContext: undefined,
    audioContext: undefined,
    analyser: undefined,
    microphone: undefined,
    javascriptNode: undefined
  }

  constructor(janus) {
    super(janus, VideoRoomPlugin.TYPE_VIDEOROOM);
  }

  attachCallbackSuccess(pluginHandle) {
    super.attachCallbackSuccess(pluginHandle);

    this.joinVideoRoom();
  }

  startRecordingProcess(stream, screenCapture) {
    super.startRecordingProcess(stream, screenCapture, Plugin.BITRATE_WEBCAM);
  }


  messageCallbackEventJoined(msg){
    super.messageCallbackEventJoined(msg);
    if(this.currentUser.isParticipant){
      this.janusService.callbacks.participantReadyCallback();
    }
  }

  messageCallbackJsep(jsep) {
    super.messageCallbackJsep(jsep);
    let type;

    if(this.currentUser.isHost){
      type = MountPoint.TYPE_WEB_CAM_HOST;
    }else{
      type = MountPoint.TYPE_WEB_CAM_CALLED_USER;
    }

    this.forwardStreamToJanusOutServers(type);
  }

  getMountPointTypeIdForDisplay(){
    let typeId;

    if(this.currentUser.isParticipant){
      typeId = MountPoint.TYPE_WEB_CAM_CALLED_USER;
    }
    if(this.currentUser.isHost){
      typeId = MountPoint.TYPE_WEB_CAM_HOST;
    }

    return typeId;
  }
}