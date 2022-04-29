import { MountPoint } from '@/services/janus/MountPoint';
import { VideoRoomPlugin } from '@/services/janus/plugins/VideoRoomPlugin';
import { Plugin } from '@/services/janus/plugins/Plugin';

export class VideoRoomInScreenPlugin extends VideoRoomPlugin {
  constructor(janus) {
    super(janus, VideoRoomPlugin.TYPE_VIDEOROOM);
  }

  attachCallbackSuccess(pluginHandle) {
    super.attachCallbackSuccess(pluginHandle);

    this.joinVideoRoom();
  }

  startRecordingProcess(stream, screenCapture) {
    super.startRecordingProcess(stream, screenCapture, Plugin.BITRATE_SCREEN_CAPTURE);
  }

  messageCallbackEventJoined(msg){
    super.messageCallbackEventJoined(msg);
  }

  messageCallbackJsep(jsep) {
    super.messageCallbackJsep(jsep);
    this.forwardStreamToJanusOutServers(MountPoint.TYPE_HOST_SCREEN);
  }

  getMountPointTypeIdForDisplay(){
    return MountPoint.TYPE_HOST_SCREEN;
  }
}