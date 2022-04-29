import useIntervalSingleton from '@/composables/useIntervalSingleton';
import {onUnmounted} from "vue"

export default function usePlaybackInterval(){

  const {setInterval, clearInterval} = useIntervalSingleton()

  const INTERVAL_ITERATION_TIME = 1000;

  const startInterval = (callback) => {
    setInterval(callback, INTERVAL_ITERATION_TIME);
  }

  const stopInterval = () => {
    clearInterval()
  }

  onUnmounted(() => {
    clearInterval()
  })

  return {
    startInterval,
    stopInterval
  }
}