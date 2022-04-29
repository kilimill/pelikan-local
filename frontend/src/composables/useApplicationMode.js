import {useStore} from "vuex";
import {computed} from "vue";
import {APP_MODE_ACTIVITY, APP_MODE_PLAYBACK} from "@/store/modules/application";
const availableModes = [APP_MODE_ACTIVITY, APP_MODE_PLAYBACK]

export default function useApplicationMode() {
    const store = useStore()
    const mode = computed({
        get: () => store.state.application.mode,
        set: vl => store.commit("application/mode", vl)
    })

    return {
        isActivity: () => mode.value === APP_MODE_ACTIVITY,
        isPlayback: () => mode.value === APP_MODE_PLAYBACK,
        isUndefined:() => !availableModes.includes(mode.value),
        setMode: value => mode.value = availableModes.includes(value) ? value : mode.value,
        setActivityMode: () => mode.value = APP_MODE_ACTIVITY,
        setPlaybackMode: () => mode.value = APP_MODE_PLAYBACK,
    }
}