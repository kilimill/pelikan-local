import {useStore} from "vuex";
import janusService from '@/services/janus'
import {computed} from "vue";

export default function useCallbacks(){

  const store = useStore();

  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const currentUser = computed(() => store.getters["user/currentUser"])

  const setJanusCallbacks = () => {
    janusService.setCallbacks({
      currentRoom: () => currentRoom.value,
      currentUser: () => currentUser.value
    });
  }

  return{
    setJanusCallbacks
  }
}