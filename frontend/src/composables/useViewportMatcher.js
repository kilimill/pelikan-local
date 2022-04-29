/**
 * Viewport matching composable
 * @param {String} mediaQueryString
 */
import {onMounted, onUnmounted, ref} from "vue";

export default function useViewportMatcher(mediaQueryString) {
    const mediaQueryList = window.matchMedia(mediaQueryString)
    const matchViewport = ref(Boolean(mediaQueryList.matches))
    const eventHandlers = ref([event => matchViewport.value = event.matches])
    const eventListener = event => eventHandlers.value.forEach(i => i(event))

    onMounted(() => mediaQueryList.addEventListener('change', eventListener))
    onUnmounted(() => mediaQueryList.removeEventListener('change', eventListener))

    return {
        mediaQueryList,
        matchViewport,
        eventHandlers,
    }
}