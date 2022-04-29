import {computed} from "vue"
import {useStore} from "vuex"

export default function useTooltipMessages(){

  const store = useStore()
  const room = store.getters["room/currentRoom"]
  const user = store.getters["user/currentUser"]
  const activeStreams = computed(() => store.getters["room/streams/activeStreams"])

  return {
    enableSwitchVideo: computed(() => !room.settings.videoStrictMode ? 'Запретить переключать камеры' : 'Разрешить переключать камеры'),
    audioOn: computed(() => {
      let val;

      if(room.isIpCamRoom && user.isHost){
        val = room.settings.typeIpAudioOn;
      }else{
        val = user.settings.audioOn;
      }

      return val ? 'Отключить микрофон' : 'Включить микрофон'
    }),
    videoOn: computed(() => {
      let val;

      if(room.isIpCamRoom && user.isHost){
        val = activeStreams.value.length > 0;
      }else{
        val = user.settings.videoOn;
      }

      return val ? 'Отключить камеры' : 'Включить камеры'
    }),
  }
}