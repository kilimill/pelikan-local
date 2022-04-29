<template>
  <div class="playback-controls">
    <div class="player">
      <div class="controls-holder">
        <button class="btn shadow-none">
          <span class="material-icons-outlined" @click="togglePlay">{{ buttonIcon }}</span>
        </button>
        <time class="playback-timeline">
          <span class="playback-timeline--current">{{ time.current }}</span>
          <span class="playback-timeline--separator">/</span>
          <span class="playback-timeline--duration">{{ time.duration }}</span>
        </time>
      </div>
      <playback-seekbar class="playback-seekbar" :value="progress" @seeked="seeked"/>
    </div>
    <button class="btn logout shadow-none" @click="logout">
      <span class="material-icons-outlined">logout</span>
    </button>
  </div>
</template>

<script>
import {computed, watch} from "vue";
import playbackService from "@/services/playback"
import PlaybackSeekbar from "@/components/playback/PlaybackSeekbar";
import useApplicationLogout from "@/composables/useApplicationLogout";
import usePlayback from "@/composables/playback/usePlayback";
import {EVENT_SEEKING, EVENT_TIMEUPDATE} from "@/services/playback/PlaybackService";

export default {
  name: "PlaybackControls",
  components: {PlaybackSeekbar},
  emits: ['play', 'stop', 'seek'],
  setup() {
    const {eventSource, duration, progress, timeline, time, controls, playing} = usePlayback()
    const {logout} = useApplicationLogout()
    const seeked = time => {
      time = duration.value / 100 * time
      playbackService.dispatchEvent(EVENT_SEEKING, {seek: time})
      console.log({time})
    }

    playbackService.addEventSource(eventSource)
    watch(timeline, value => value ? eventSource.dispatchEvent(EVENT_TIMEUPDATE, {currentTime: value}) : null)

    return {
      value: 30,
      togglePlay: controls.toggle,
      logout,
      playing,
      duration,
      timeline,
      progress,
      time,
      seeked,
      buttonIcon: computed(() => playing.value
          ? 'pause_circle'
          : 'play_circle'
      )
    }
  }
}
</script>

<style scoped lang="scss">
.controls-holder {
  .playback-seekbar {
    margin-bottom: 10px;
    transition: height .15s;
  }

  .playback-seekbar:hover,
  :hover .playback-seekbar {
    height: .6em;
  }
}

.playback-controls {
  display: flex;
  color: white;
  padding-bottom: 0;
  user-select: none;

  .player {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    justify-content: space-between;
  }

  .player .playback-timeline {
    display: flex;
    font-size: 1.5em;
    * > { display: flex; }
    &--current, &--duration {

    }

    &--separator {margin: 0 5px; }
  }

  .player .controls-holder {
      display: flex;
  }
}


button.btn {
  font-size: 1.5rem;
  padding: 0.25rem;
  line-height: 1;
  color: white;

  :hover {
    color: #999;
  }
}


</style>