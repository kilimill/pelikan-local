import {useStore} from "vuex";
import useApplicationMode from "@/composables/useApplicationMode";
import useApplicationError from "@/composables/useApplicationError";
import useApplicationRoute from "@/composables/useApplicationRoute";
import {computed} from "vue";

export default function useRoomInitialization() {
    const store = useStore()
    const applicationMode = useApplicationMode()
    const applicationError = useApplicationError()
    const applicationRoute = useApplicationRoute()
    const loading = computed(() => !store.state.application.ready)

    const initRoom = () => {
        if (loading.value) {
            return store.dispatch('initRoom').then(() => {
                store.commit("media/setMainSelectValue", 0)
                store.commit("application/loading", false)
            }).catch(applicationError.setError)
        } else return Promise.resolve()
    }

    return {
        loading,
        initRoom: () => {
           return applicationMode.isActivity()
               ? initRoom()
               : applicationRoute.resolve()
        }
    }
}