<template>
      <video ref="player" id="screen-player" muted autoplay>
      </video>
      <div ref="playerCanvasWrapper" id="screen-player-canvas-wrapper">
        <div ref="playerCanvasAreaWrapper" id="screen-player-canvas-area-wrapper"  v-if="isActivity()">
          <canvas ref="playerCanvas" id="screen-player-canvas"/>
        </div>
        <div class="screen-player-playback" v-if="isPlayback()">
          <playback-player id="screen" :src="playbackSrc" :current-time="offset"/>
        </div>
        <div class="screen-capture-controls">
          <button class="btn btn-outline-transparent" data-bs-title="Смотреть в большом окне"
                  v-show="isSmallPlace"
                  @click="switchPlaces()">
            <span class="material-icons">switch_video</span>
          </button>
          <button class="btn btn-outline-transparent camera-video-full camera-video-btn-panel">
            <span ref="playerToggleFullscreenButton" class="material-icons">fullscreen</span>
          </button>
        </div>

      </div>
</template>

<script>
import {mapGetters, useStore} from 'vuex'
import {computed} from 'vue'
import {ScreenPlayer} from '@/services/janus/Player'
import janusService from '@/services/janus'
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";
import useApplicationMode from "@/composables/useApplicationMode";
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
import usePlayback from "@/composables/playback/usePlayback";
import PlaybackPlayer from "@/components/playback/PlaybackPlayer";

export default {
  name: 'ScreenCapture',
  components: {PlaybackPlayer},
  active: false,
  emits: ['componentsData'],
  setup() {
    const store = useStore()
    const {isSmallPlace, switchPlaces} = usePlacesInjection()
    const {isActivity, isPlayback} = useApplicationMode()
    const {timeline} = usePlayback()
    const {currentVideo, availableScreens: screens} = usePlaybackVideos(timeline)
    const playbackSrc = computed(() => screens.value.length ? screens.value[0].link : null)


    return {
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      isSmallPlace,
      switchPlaces,
      isActivity,
      offset: computed(() => currentVideo.value.offset),
      isPlayback,
      playbackSrc,
    }
  },
  data (){
    return {
      player: undefined,
    }
  },
  watch: {
    roomStatusId (newVal) {
      if(this.isActivity && newVal !== this.constants.room.STATUS_EVENT_ACTIVE){
        this.player.stopInterval();
        this.player.clearCanvas();
      }
    },
    mediaStreamScreen(newVal){
      if(this.isActivity && this.currentUser.isHost && newVal === undefined){
        janusService.stopScreenCapture();
        this.$emit('componentsData', {
          component: this.$options.name,
          event: 'error'
        });
      }
    }
  },
  computed: {
    ...mapGetters('application', [
      'constants',
    ]),
    ...mapGetters('media', [
      'mainSelectValue',
      'mediaDevicesAudioSelected',
      'mediaStreamScreen'
    ]),
    ...mapGetters('room', [
      'roomStatusId',
    ]),
    ...mapGetters('room/settings', [
      'screenCaptureActive',
    ]),
  },
  methods: {
    init () {
      janusService.setPlayer('screen', this.$refs.player);
      this.setScreenPlayer();

      if(this.currentRoom.isActive){
        janusService.watchScreenCaptureVideo(this.$refs.player);
      }
    },
    setScreenPlayer () {
      if(this.player === undefined){
        this.player = new ScreenPlayer(this.$refs);
      }
    },
  },
  mounted () {
    if (this.isActivity) {
      this.init();
    }
  },
  unmounted(){
    if (this.isActivity) {
      janusService.unsetPlayer('screen');
    }
  }


};
</script>

<style scoped lang="scss">
.camera-video-btn-panel span:hover{
  color: #aaa;
}

#screen-player{
  position: absolute;
  z-index: 5;
  visibility: hidden;
}

#screen-player-canvas-wrapper{
  position: relative;
  z-index: 1000;
  width: 100%;
  height: 100%;
  left: 0;
  right: 0;

  [data-placement=small] & {
    min-height: 200px;
  }
}

#screen-player-canvas-area-wrapper{
  position: absolute;
}
.gradient-block{
  display: block;
  position: absolute;
  bottom: 0;
  height: 30%;
  max-height: 200px;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0, 0, 0, 0.35) 100%);
}
#screen-player-control-panel{
  display: block;
  position: absolute;
  bottom: 0;
  height: 50px;
  width: 100%;
  background-color: rgba(186, 186, 186, 0);
}

#screen-player-toggle-fullscreen-button{
  position: absolute;
  right: 25px;
  top: calc(50% - 8px);
  cursor: pointer;
  color: white;
  text-stroke: 1px black;
  -webkit-text-stroke: 1px black;
  height: 25px;
  width: 25px;
}

.screen-capture-controls{
  z-index: 1001;
  position: absolute;
  right: 0;
  bottom:0;
}

.screen-player-playback {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>