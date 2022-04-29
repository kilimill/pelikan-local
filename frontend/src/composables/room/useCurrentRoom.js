import {computed} from "vue";
import {useStore} from "vuex";

export default function useCurrentRoom(){

    const store = useStore()
    const currentRoom = computed(() =>store.getters["room/currentRoom"])

    return {
      currentRoom,
      isPlayback: computed(() => Boolean(currentRoom.value.isPlayback)),
    }
}