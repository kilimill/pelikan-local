<template>
  <div class="video-player" ref="container">
    <span class="player-overlay"></span>
    <canvas ref="canvas" @click="togglePlay"></canvas>
    <time class="current-time">{{ timelinee }}</time>
  </div>
</template>

<script>
import playbackService from "@/services/playback";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import useIntervalSingleton from "@/composables/useIntervalSingleton";
import videoElement from "@/composables/playback/video/videoElement";
import usePlayback from "@/composables/playback/usePlayback";
import usePlaybackVideos from "@/composables/playback/usePlaybackVideos";
import { EVENT_SEEKING } from "@/services/playback/PlaybackService";
import useChatMessages from "@/composables/chat/useChatMessages";
import useRoomSettings from "@/composables/room/useRoomSettings";
// import { checkPromiseAmount } from "@/composables/playback/video/timingPlayers.js";
export default {
  name: "PlaybackPlayer",
  props: {
    src: String,
    currentTime: { type: Number, default: 0 },
    id: { type: String },
  },
  emits: ["video:waiting", "video:ready"],
  setup(props) {
    let num = 0;
    const currentTime = computed(() => props.currentTime);
    const canvasElement = ref();
    const rootElement = ref();
    const src = computed(() => props.src);
    const { clearChatMessages } = useChatMessages();
    const { roomEnableScreenCapture } = useRoomSettings();
    const {
      currentElement,
      playing: videoPlaying,
      currentTime: videoTime,
      controls,
      canPlay,
    } = videoElement(src, currentTime, roomEnableScreenCapture);

    const { playing: playbackPlaying, waiting, timeline } = usePlayback();
    const { playlist } = usePlaybackVideos();
    const currentVideo = computed(() =>
      playlist.value.find((i) => i.link === currentElement.value.src)
    );

    const { clearInterval, setInterval } = useIntervalSingleton();
    const dimensions = { aspectRatio: 0, width: 0, height: 0 };

    const watingPlayers = (event) => {
      // console.log(timeline.value)
      let generalTime = timeline.value
      // console.log('videoPlayingvideoPlayingvideoPlaying')
      controls.pause();
      playbackPlaying.value = false
      if (!currentVideo.value || currentVideo.value.time.start > generalTime || currentVideo.value.time.end < generalTime) {
        // checkPromiseAmount(true);
        return;
      }

      let seek = event?.seek ? event.seek : 0;
      if (num > seek) {
        clearChatMessages();
      }
      let timeSeek;
        // generalTime;

      console.log(currentVideo.value)
      if (seek === 0) {
        timeSeek = currentTime.value - currentVideo.value.time.start;
        // generalTime = currentTime.value + currentVideo.value.time.start;
        timeSeek < 0 ? controls.waiting(currentTime.value, seek, generalTime) : controls.waiting(timeSeek, seek, generalTime);
        // console.log('CHEEECK')
        // console.log(timeSeek)
        // console.log(currentTime.value)
      } else {
        timeSeek = seek - currentVideo.value.time.start;
        // generalTime = seek + currentVideo.value.time.start;
        // console.log('CHEEECK')
        // console.log(timeSeek)
        // console.log(currentTime.value)
        if(timeSeek > 0) {
          controls.waiting(timeSeek, seek, generalTime);
        }
      }
      num = seek;
    };
    const seekEventHandler = (event) => {
      // console.log(timeline.value)
      let generalTime = timeline.value
      // console.log('videoPlayingvideoPlayingvideoPlaying')
      controls.pause();
      playbackPlaying.value = false
      if (!currentVideo.value || currentVideo.value.time.start > generalTime || currentVideo.value.time.end < generalTime) {
        // checkPromiseAmount(true);
        return;
      }

      let seek = event?.seek ? event.seek : 0;
      if (num > seek) {
        clearChatMessages();
      }
      let timeSeek;
        // generalTime;

      console.log(currentVideo.value)
      if (seek === 0) {
        timeSeek = currentTime.value - currentVideo.value.time.start;
        // generalTime = currentTime.value + currentVideo.value.time.start;
        timeSeek < 0 ? controls.seek(currentTime.value, seek, generalTime) : controls.seek(timeSeek, seek, generalTime);
        // console.log('CHEEECK')
        // console.log(timeSeek)
        // console.log(currentTime.value)
      } else {
        timeSeek = seek - currentVideo.value.time.start;
        // generalTime = seek + currentVideo.value.time.start;
        // console.log('CHEEECK')
        // console.log(timeSeek)
        // console.log(currentTime.value)
        if(timeSeek > 0) {
          controls.seek(timeSeek, seek, generalTime);
        }
      }
      num = seek;
    };

    const render = () => {
      let canvas = canvasElement.value,
        ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        ctx.drawImage(
          currentElement.value,
          0,
          0,
          dimensions.width,
          dimensions.height
        );
      }
    };

    const calculate = () => {
      if (rootElement.value) {
        let boundedRect = rootElement.value.getBoundingClientRect(),
          videoWidth = currentElement.value.videoWidth || boundedRect.width,
          videoHeight = currentElement.value.videoHeight || boundedRect.height;

        dimensions.aspectRatio = Math.min(
          boundedRect.width / videoWidth,
          boundedRect.height / videoHeight
        );
        dimensions.width = Math.floor(videoWidth * dimensions.aspectRatio);
        dimensions.height = Math.floor(videoHeight * dimensions.aspectRatio);
      }
    };

    watch(currentElement, () => {
      // console.log('KNNKONKLNKL')
      // console.log(videoPlaying.value)
      if(currentVideo.value && playbackPlaying.value) {
        watingPlayers();
      }
      calculate();
      render();
    });

    watch(videoPlaying, (value) => (playbackPlaying.value = value));
    watch(
      playbackPlaying,
      (value) => {
        value ? controls.play() : controls.pause();
      },
      { immediate: true }
    );

    watch(canPlay, (value) => (waiting.value = { [props.id]: value }));

    onMounted(() => {
      calculate();
      setInterval(() => render(), 1);
      if(playbackPlaying.value) {
        watingPlayers(); 
      }
      playbackService.addEventListener(EVENT_SEEKING, seekEventHandler);
    });

    onUnmounted(() => {
      clearInterval();
      playbackService.removeEventListener(EVENT_SEEKING, seekEventHandler);
    });

    return {
      seekEventHandler,
      canvas: canvasElement,
      container: rootElement,
      togglePlay: () =>
        videoPlaying.value ? controls.pause() : controls.play(),
      dimensions,
      timelinee: computed(() => {
        let time = Math.round(videoTime.value / 1000),
          date = new Date(0);
        date.setSeconds(date.getTimezoneOffset() * 60 + time);
        return date.toLocaleTimeString();
      }),
    };
  },
};
</script>

<style scoped lang="scss">
.video-player {
  display: flex;
  position: relative;
  width: 100%;
}

.video-player canvas {
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  background-color: black;
}

.video-player .current-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}
</style>