import {useStore} from "vuex"

import {onMounted, onUnmounted} from "vue";
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";

export default function useConnectionStatusEvents(){

  const store = useStore()

  const {setTimeout, clearTimeout} = useTimeoutSingleton()

  const keepJanusAliveTimerValueMs = 10000
  let restartJanusVal = false;

  const getRestartJanus = () => restartJanusVal

  const eventListener = event => {
    if(event.type === 'offline'){
      restartJanusVal = false;
      setTimeout(() => {
        restartJanusVal = true;
      }, keepJanusAliveTimerValueMs);
    }

    if(event.type === 'online'){
      clearTimeout()
    }

    store.commit('application/online', event.type === 'online')
  }

  const removeEvents = () => {
    window.removeEventListener('online', eventListener);
    window.removeEventListener('offline', eventListener);
  }

  onMounted(() => {
    removeEvents();

    store.commit('application/online', navigator.onLine)

    window.addEventListener('online', eventListener);
    window.addEventListener('offline', eventListener);

  })
  onUnmounted(() => {
    removeEvents()
  })

  return {
    getRestartJanus
  }
}