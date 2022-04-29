import {useStore} from "vuex";
import {computed} from "vue";
import usePlaybackTimer from '@/composables/playback/usePlaybackTimer';

export default function usePlaybackHandlers(){

  const store = useStore();
  const {secondsToTime} = usePlaybackTimer()

  const duration = computed(() => store.getters["playback/timeline/duration"]);
  const currentValue = computed(() => store.getters["playback/timeline/currentValue"]);
  const playbackIsActive = computed(() => store.getters["playback/timeline/active"]);
  const playbackIsAtStart = computed(() => store.getters["playback/timeline/isAtStart"]);
  const playbackIsAtEnd = computed(() => store.getters["playback/timeline/isAtEnd"]);
  const startPlayback = () => {
    if(playbackIsAtEnd.value){
      store.dispatch('playback/timeline/manualSeek', false).then(() =>
        store.dispatch("playback/timeline/seekToValue", {
          newVal: 0,
          manual: true
        }).then(() => {
          store.commit("playback/timeline/setActive", true);
        }))

    }else{
      store.commit("playback/timeline/setActive", true);
    }
  }
  const pausePlayback = () => {
    store.commit('playback/timeline/setActive', false);
    store.dispatch("playback/timeline/stopInterval");
  }

  return {
    currentValue: computed({
      get: () => currentValue.value,
      set: (vl) => {
        store.dispatch("playback/timeline/stopInterval").then(() =>
          store.dispatch('playback/timeline/manualSeek', false).then(() =>
            store.dispatch("playback/timeline/seekToValue", {
          newVal: vl,
          manual: true
        })));
      }
    }),
    duration,
    playbackIsActive,
    playbackIsAtStart,
    playbackIsAtEnd,
    startPlayback,
    pausePlayback,
    secondsToTime
  }
}