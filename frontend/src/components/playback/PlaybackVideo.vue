<template>
  <div class="playback-video" ref="content">
    <div class="select-holder">
      <drop-down-select class="video-select" :disabled="!enabledSelect" v-model="selectedVideo" :options="selectOptions"/>
    </div>

    <playback-player class="video-player" :src="currentVideo.link" :current-time="offset" />
    <video-controls class="video-player-panel video-controls" :placement="placement" @fullscreen="toggleFullscreen"/>
  </div>
</template>

<script>
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
import PlaybackPlayer from "@/components/playback/PlaybackPlayer";
import VideoControls from "@/components/common/VideoControls";
import useFullscreenToggle from "@/composables/useFullscreenToggle";
import usePlayback from "@/composables/playback/usePlayback";
import {computed} from "vue";
import DropDownSelect from "@/components/common/DropDownSelect";
import useRoomSettings from "@/composables/room/useRoomSettings";

export default {
  name: "PlaybackVideo",
  components: {DropDownSelect, VideoControls, PlaybackPlayer},
  props: {placement: String},
  data: () => ({
    currentTime: 0,
  }),
  setup(/*props, {emit}*/) {
    const {timeline, duration} = usePlayback()
    const {currentVideo, availableVideo} = usePlaybackVideos(timeline)
    const {toggleFullscreen, fullscreenElement} = useFullscreenToggle()
    const {roomEnableSwitchVideo: enabledSelect, mutateSetting} = useRoomSettings()
    const selectedVideo = computed({
      get: () => currentVideo.value.meta.mountPoint,
      set: vl => mutateSetting('activeMountPointId', vl)
    })
    const selectOptions = computed(() => availableVideo.value.map(i => ({name: i.name, value: i.meta.mountPoint})))
    return {
      timeline,
      duration,
      currentVideo,
      selectedVideo,
      enabledSelect,
      selectOptions,
      toggleFullscreen,
      offset: computed(() => currentVideo.value.offset),
      content: fullscreenElement,
    }
  }
}
</script>

<style scoped lang="scss">
.playback-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-content: center;
  padding: 0;
  position: relative;
}

.playback-video .video-player-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0;
  margin: 10px;
  /* z-index: 1001; */
  background: rgba(0, 0, 0, .4);
  transition: opacity .3s;
  opacity: 0;
}

.playback-video:hover .video-player-panel {
    opacity: 1;
}

.place-holder--small .playback-video {
  .select-holder {width: 100%;}
}
.place-holder--large .playback-video {
  .select-holder {
    position: fixed;
    top: 20px;
    left: 20px;
  }
}

.tab-content .playback-video {
  display: flex;
  flex-direction: column;
  flex: 1 0 100%;

  .select-holder { width: 100%; }
  .video-player {
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    justify-content: center;
    background: black;
  }
}
</style>