<template>
  <div class="camera" ref="content" :class="rootElementClassList" v-bind="$attrs">
    <div class="camera-select">
      <div>
        <drop-down-select :disabled="videoSelectDisabled" v-model="selectedSource" :options="videoSourcesList"/>
      </div>
    </div>
    <div class="camera-window">
      <div class="camera-video" :class="{play: showPlayer}">
        <span class="camera-video-text" v-show="currentRoom.isPending">
          {{ currentUser.isHost ? 'Для начала трансляции мероприятия нажмите кнопку Старт ►' : 'Мероприятие скоро начнётся' }}
        </span>
        <span class="camera-video-text" v-show="currentRoom.isPaused">Мероприятие приостановлено</span>
        <span class="camera-video-text" v-show="currentRoom.isFinished">Мероприятие завершено</span>
        <span class="camera-video-text" v-show="showNoVideoText">Камеры отключены</span>
        <div v-show="showPlayer" id="video-wrapper-block">
          <video ref="player" id="video-player" muted autoplay></video>
          <div ref="playerCanvasWrapper" id="main-player-canvas-wrapper">
            <div ref="playerCanvasAreaWrapper" id="main-player-canvas-area-wrapper">
              <canvas ref="playerCanvas" id="main-player-canvas">
              </canvas>
            </div>
          </div>

        </div>
      </div>
      <div class="camera-video-full camera-video-btn-panel">
        <button
            v-if="currentUser.isHost"
            @click="roomSettings.enableSwitchVideo = !roomSettings.enableSwitchVideo"
            class="btn disable-camera-change"
            :data-bs-title="messages.enableSwitchVideo">
          <span class="material-icons">{{ roomSettings.enableSwitchVideo ? 'code' : 'code_off' }}</span>
        </button>

        <button
            v-if="showMediaToggleIcons"
            class="btn mic-off" :data-bs-title="messages.audioOn"
            @click="audioButtonHandler">
          <span class="material-icons">{{ audioToggleButtonIconCondition ? 'mic' : 'mic_off' }}</span>
        </button>
        <button
            v-if="showMediaToggleIcons"
            class="btn camera-off" :data-bs-title="messages.videoOn"
            @click="videoButtonHandler">
          <span class="material-icons">{{ videoToggleButtonIconCondition ? 'videocam' : 'videocam_off' }}</span>
        </button>
        <button v-show="isSmallPlace" @click="switchPlaces" class="btn switch-places" data-bs-title="Смотреть в большом окне">
          <span class="material-icons">switch_video</span>
        </button>
        <button ref="playerToggleFullscreenButton" class="btn full-screen" data-bs-title="На весь экран">
          <span class="material-icons">fullscreen</span>
        </button>
      </div>
    </div>
  </div>

</template>

<script>

import DropDownSelect from "@/components/common/DropDownSelect";
import {mapGetters, mapMutations, useStore} from 'vuex'
import {computed, reactive, ref} from "vue"
import {MainPlayer} from '@/services/janus/Player'
import janusService from '@/services/janus';
import roomApi from '@/api/room';
import userApi from '@/api/user';
import useUsersRepository from "@/composables/users/useUsersRepository";
import useUserSettings from "@/composables/users/useUserSettings";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useTooltipMessages from "@/composables/useTooltipMessages";
import useMessageSubscription from "@/composables/useMessageSubscription";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";

export default {
  name: "RoomVideo",
  components: {DropDownSelect},
  props: {placement: String},
  data() {
    return {
      selectedSource: undefined,
      unsubscribeActions: undefined,
      player: undefined,
    }
  },
  setup(props) {
    const store = useStore()
    const {userIsHost, userIsCurrent} = useUsersRepository()
    const {userEnableAudio, userEnableVideo} = useUserSettings(store.state.user.id)
    const {roomEnableIpRoomAudio, roomEnableSwitchVideo, roomEnableUserCallControl} = useRoomSettings()

    const {on, off} = useMessageSubscription(store.getters["application/getChannels"])
    const {isLargePlace, isSmallPlace, switchPlaces} = usePlacesInjection(computed(() => props.placement))
    const rootElement = ref()
    const {setTimeout} = useTimeoutSingleton()

    const {enableSwitchVideo, audioOn, videoOn} = useTooltipMessages();

    useBootstrapTooltip(rootElement, "[data-bs-title]")

    return {
      content: rootElement,
      isHost: userIsHost(store.state.user.id),
      currentUserIsHost: userIsHost(store.state.user.id),
      isCurrent: userIsCurrent(store.state.user.id),
      isCalled: computed(() => store.getters["room/users/isCalled"]),
      calledUser: computed(() => store.getters["room/users/calledUser"]),
      host: computed(() => store.getters["room/users/host"]),

      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),

      messages: reactive({
        enableSwitchVideo: enableSwitchVideo,
        audioOn: audioOn,
        videoOn: videoOn
      }),

      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
      }),

      roomSettings: reactive({
        enableSwitchVideo: roomEnableSwitchVideo,
        enableAudio: roomEnableIpRoomAudio,
        enabledUserCallControl: roomEnableUserCallControl
      }),
      switchPlaces,
      isSmallPlace,
      isLargePlace,
      on, off,
      setTimeout
    }
  },
  computed: {
    ...mapGetters('application', [
      'constants',
      'mountPoints',
      'userCallControlInProgress',
      'userCallControlTimeout',
    ]),
    ...mapGetters('room', [
      'roomStatusId',
    ]),
    ...mapGetters('room/streams', [
      'activeStreams',
      'allStreams',
    ]),
    ...mapGetters('media', [
      'mediaDevicesAudioList',
      'mediaDevicesVideoList',
      'mediaAudioSelected',
      'mediaVideoSelected',
    ]),
    activeMountPointId(){
      return this.currentRoom.settings.activeMountPointId;
    },
    hasAudio () {
      return this.audioList.length > 0;
    },
    hasVideo () {
      return this.videoList.length > 0;
    },
    audioList(){
      return this.mediaDevicesAudioList;
    },
    videoList(){
      return this.mediaDevicesVideoList;
    },
    audioSelected: {
      get () {
        return this.mediaAudioSelected;
      },
      set (value) {
        this.setAudioSelected(value);
      }
    },
    videoSelected: {
      get () {
        return this.mediaVideoSelected;
      },
      set (value) {
        this.setVideoSelected(value);
      }
    },
    showMediaToggleIcons(){
      return this.currentUser.isHost || this.currentUser.isCalled;
    },
    videoSelectDisabled(){
      return this.currentUser.isParticipant && !this.roomSettings.enableSwitchVideo;
    },
    hostVideoOn(){
      return this.host && this.host.settings.videoOn;
    },
    showPlayer(){
      return this.currentRoom.isActive && this.videoSourcesList.length > 0;
    },
    showNoVideoText(){
      return this.currentRoom.isActive && this.videoSourcesList.length === 0;
    },
    streamsList(){
      return this.activeStreams.map((val) => ({
        value: val.mountpointId,
        name: val.name
      }))
    },
    videoSourcesList(){
      let arr = [];

      if(this.currentRoom.isWebCamRoom && this.hostVideoOn){
        arr.push(
            {value: this.mountPoints.web?.host.id, name: 'Ведущий'},
        );
      }
      if(this.currentRoom.isIpCamRoom && this.streamsList.length > 0){
        arr = arr.concat(this.streamsList);
      }
      if(
          this.calledUser &&
          this.calledUser.settings.videoOn &&
          this.calledUser.hasVideo &&
          !this.affectedByCallControl
      ){
        arr.push(
            {value: this.mountPoints.web.called.id, name: this.calledUser.alias},
        );
      }else if(this.currentUser.isCalled && this.userSettings.enableVideo){
        arr.push(
            {value: this.mountPoints.web.called.id, name: this.currentUser.name},
        );
      }

      return arr;
    },
    audioToggleButtonIconCondition(){
      let cond;
      if(this.currentRoom.isIpCamRoom && this.currentUser.isHost){
        cond = this.roomSettings.enableAudio;
      }else{
        cond = this.userSettings.enableAudio;
      }
      return cond;
    },
    videoToggleButtonIconCondition(){
      let cond;
      if(this.currentRoom.isIpCamRoom && this.currentUser.isHost){
        cond = this.activeStreams.length > 0;
      }else{
        cond = this.userSettings.enableVideo;
      }
      return cond;
    },
    userAffectedByCallControl(){
      return this.currentUser.isParticipant &&
          this.currentUser.isNotCalled;
    },
    affectedByCallControl() {
      return this.roomSettings.enabledUserCallControl &&
          this.userCallControlInProgress &&
          this.userAffectedByCallControl;
    },
    rootElementClassList() {
      return [`camera--${this.placement}`, this.showPlayer ? 'play' : 'no-play']
    }
  },
  watch: {
    videoSourcesList: {
      deep: true,
      handler(newVal){
        if(
            newVal.find(i => i.value === this.selectedSource) === undefined &&
            this.videoSourcesList.length > 0
        ){
            this.selectedSource = this.videoSourcesList[0].value;
        }
      }
    },
    roomStatusId (newVal) {
      if(newVal !== this.constants.room.STATUS_EVENT_ACTIVE) {
        this.player.stopInterval();
        this.player.clearCanvas();
      }
    },
     selectedSource(newVal, oldVal){
        if(oldVal !== undefined && newVal !== undefined){
          if(this.currentUser.isHost){
            roomApi.watch(this.currentRoom.id, newVal);
          }else if(!this.affectedByCallControl){
            janusService.switchStream(
                !!(this.calledUser || this.currentUser.isCalled
                ), newVal);
          }
        }
     }
  },
  methods: {
    ...mapMutations('room/streams', [
      'toggleStream',
    ]),
    audioButtonHandler(){
        if(this.currentRoom.isIpCamRoom && this.currentUser.isHost){
          this.roomSettings.enableAudio = !this.roomSettings.enableAudio;
        }else{
          this.userSettings.enableAudio = !this.userSettings.enableAudio;
        }
    },

    videoButtonHandler(){
      if(this.currentRoom.isIpCamRoom && this.currentUser.isHost){
        this.ipCamerasToggle(this.activeStreams.length > 0 ? 0 : 1);
      }else{
        this.userSettings.enableVideo = !this.userSettings.enableVideo;
      }
    },
    ipCamerasToggle(value){
      roomApi.massToggleIpCamVideo(value, this.currentRoom.id);
    },

    init() {
      janusService.setPlayer('video', this.$refs.player);
      this.setMainPlayer();

      this.setInitValue();
      this.setInitSwitchStream();

      this.messageSubscribe();
    },

    setInitSwitchStream(){
      if(this.currentRoom.isActive && janusService.janus.out !== undefined){
          janusService.switchStream(
              !!(this.calledUser || this.currentUser.isCalled),
              this.affectedByCallControl ? this.selectedSource : null
          )
      }
    },

    messageSubscribe() {
      this.on(this.constants.events['ROOM_DROP_USER_CALL'], e => {
        this.eventDropUserCallHandler(e.data);
      })
      this.on(this.constants.events['ROOM_USER_CALL_CONTROL_PASSED'], e => {
        this.eventUserCallControlPassedHandler(e.data);
      })
      this.on(this.constants.events['USER_PARTICIPANT_STREAM'], e => {
        this.eventUserParticipantStreamHandler(e.data);
      })
      this.on(this.constants.events['STREAM_WATCH'], e => {
        this.eventStreamWatchHandler(e.data);
      })
    },

    setInitValue(){
      let selectedSource;
      if(this.affectedByCallControl){
        if(this.currentRoom.isWebCamRoom){
          selectedSource = this.mountPoints.web.host.id;
        }
        if(this.currentRoom.isIpCamRoom && this.activeStreams.length > 0){
          selectedSource = this.activeStreams[0].mountpointId;
        }
      }else{
        selectedSource = this.activeMountPointId;
      }

      this.selectedSource = selectedSource;
    },

    setMainPlayer() {
      this.player = new MainPlayer(this.$refs);
    },

    eventDropUserCallHandler(data){
      janusService.afterDropUserCallHandler();

      this.selectedSource = undefined;
      janusService.clearMainPlayer();

      this.selectedSource = data.activeMountPointId;

      janusService.switchStream();
    },
    eventUserParticipantStreamHandler(){
      //switch to called user video, if it exists,
      // or switch secondary player stream without video switching.

      if (this.currentUser.isNotCalled && this.calledUser) {
        if (this.calledUser.settings.videoOn && this.currentUser.isHost) {
          this.selectedSource = this.mountPoints.web.called.id;
        } else {
          janusService.switchSecondaryStream(this.mountPoints.web.called.id);
        }
      }

      //enable call control passed timeout
      if(this.currentUser.isHost && this.roomSettings.enabledUserCallControl){
        this.setTimeout(() => {
          userApi.userCallControlPassed();
        }, this.userCallControlTimeout);
      }
    },
    eventUserCallControlPassedHandler(){
      if (this.calledUser && this.userAffectedByCallControl) {
        if (this.calledUser.settings.videoOn && (this.activeMountPointId === this.mountPoints.web.called.id)) {
            this.selectedSource = this.mountPoints.web.called.id;
        } else {
          janusService.switchSecondaryStream();
        }
      }
    },
    eventStreamWatchHandler(data){
      if(this.currentUser.isHost){
        janusService.switchStream(
            !!(this.calledUser || this.currentUser.isCalled)
        );
      }else if(!this.affectedByCallControl){
        this.selectedSource = data.activeMountPointId;
      }
    }
  },
  mounted() {
    this.init();
  },
  unmounted(){
    this.player = undefined;
    janusService.unsetPlayer('video');
  }
}
</script>

<style scoped lang="scss">
.camera {
  display: flex;
  flex-direction: column;
  flex: 1 0 100%;

  &.no-play:is(&--large){
    flex: 0 0 50%;
  }

  .camera-window,
  .camera-video {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
  }

  .camera-video:not(.play) {
    justify-content: center;
    align-items: center;
  }

  &--small {}

  &--large {
    .camera-select {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  }

  &--tab {
    .switch-places {
      display: none;
    }
  }
}


.camera-window {
  position: relative;
}

.camera-video-btn-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 10px;
  z-index: 1001;
}

.camera-video-btn-panel button {
  color: #fff;
  cursor: pointer;
  font-size: 1.3em;
  padding: 0 5px;
}

.camera-video-btn-panel button{
  color: #fff;
  cursor: pointer;
}

.camera-video-btn-panel button:focus {
  box-shadow: none;
}

.camera-video-btn-panel button:hover {
  color: #aaa;
}

.camera-video {
  background: black;
  min-height: 200px;
}

#video-wrapper-block {
  display: flex;
  position: relative;
  flex: 1 0 100%;

}

#video-player {
  position: absolute;
  z-index: 5;
  visibility: hidden;
}

#main-player-canvas-wrapper {
  position: absolute;
  z-index: 1000;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;
}

#main-player-canvas-area-wrapper {
  position: absolute;
}
.dropdown-select{
  z-index: 1020;
}

.camera-video-text {
  color: #fff;
  text-align: center;
}
</style>