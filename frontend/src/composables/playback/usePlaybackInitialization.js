import {useStore} from "vuex";
import useApplicationMode from "@/composables/useApplicationMode";
import useApplicationError from "@/composables/useApplicationError";
import useApplicationRoute from "@/composables/useApplicationRoute";
import {computed} from "vue";

export default function usePlaybackInitialization() {
    const store = useStore()
    const applicationMode = useApplicationMode()
    const applicationError = useApplicationError()
    const applicationRoute = useApplicationRoute()
    const loading = computed(() => !store.state.application.ready)

    const initPlayback = () => {
        if (loading.value) {
            return store.dispatch('initPlayback').then(() => {
                store.commit("application/loading", false)
            }).catch(applicationError.setError)
        } else return Promise.resolve()
    }

    return {
        loading,
        initPlayback: () => {
            return applicationMode.isPlayback()
                ? initPlayback()
                : applicationRoute.resolve()
        }
    }
}