import {useStore} from "vuex";
import {computed} from "vue";

export default function useCurrentUserHandRise() {

    const store = useStore()

    const toggleUserRaiseHand = computed({
        get: () => Boolean(store.state.user.handRaised),
        set: () => store.dispatch('user/raiseHand'),
    })
    const cantRaiseHand = computed(() => !store.getters["user/canRaiseHand"])
    const blockRoomRaiseHand = computed(() => store.state.room.settings.blockRaiseHand)

    return {
        toggleUserRaiseHand,
        cantRaiseHand,
        blockRoomRaiseHand
    }
}