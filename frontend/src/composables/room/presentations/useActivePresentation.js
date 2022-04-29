import {useStore} from "vuex";
import {computed} from "vue";

/**
 * Активная презентация
 */
export default function useActivePresentation() {
    const store = useStore()
    const defaultPresentation = computed(() => store.getters["room/presentations/defaultPresentation"])
    const currentPresentation = computed(() => store.getters["room/presentations/currentPresentation"])
    const activePresentation = computed(() => currentPresentation.value || defaultPresentation.value)

    const selectCurrentPresentation = (id, soft = false) => {
        soft
            ? store.commit('room/presentations/currentPresentation', id)
            : store.dispatch("room/presentations/currentPresentation", id)
    }
    const slideCurrentPresentation = (index, soft = false) => soft
        ? store.commit("room/presentations/currentPresentationSlide", index)
        : store.dispatch("room/presentations/currentPresentationSlide", index)
    const selectPresentation = (presentationId, slideIndex, soft = false) => soft
        ? store.commit('room/presentations/presentationSelect', {presentationId, slideIndex})
        : store.dispatch("room/presentations/selectPresentation", {presentationId, slideIndex})

    return {
        defaultPresentation,
        currentPresentation,
        activePresentation,
        selectCurrentPresentation,
        slideCurrentPresentation,
        selectPresentation,
    }
}