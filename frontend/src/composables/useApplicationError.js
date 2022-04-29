import {useStore} from "vuex";
import {computed} from "vue";

export default function useApplicationError() {
    const store = useStore()
    const error = computed({
        get: () => store.state.application.error,
        set: vl => store.commit('application/error', vl),
    })

    return {
        hasError: computed(() => Boolean(error.value)),
        setError: value => error.value = value,
        getError: () => error.value,
    }
}