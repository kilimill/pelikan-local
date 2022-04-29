import {computed, onMounted, onUnmounted, ref, watchEffect} from "vue";
import useVideoEvents from "@/composables/playback/video/useVideoEvents";

/*const element = document.createElement('video')
const src = ref()

element.autoplay = false
element.controls = true*/

const elements = {}

/**
 *
 * @param id
 * @return {{
 *     element: HTMLVideoElement,
 *     src: import("@vue/reactivity/dist/reactivity").UnwrapRef
 *     currentTime: import("@vue/reactivity/dist/reactivity").UnwrapRef
 *     playing: import("@vue/reactivity/dist/reactivity").UnwrapRef
 * }}
 */
const getElement = function (id) {
    if (typeof elements[id] === "undefined") {
        const element = document.createElement('video')
        element.autoplay = false
        element.controls = false
        elements[id] = {element, src: ref(''), playing: ref(false), currentTime: ref(0), duration: ref(0)}
    }

    return elements[id]
}

export default function useVideoElement(id = 'default') {
    const {element, src, currentTime, duration, playing} = getElement(id)
    const videoEvents = useVideoEvents(element)
    const readyState = ref(false)
    const progress = computed(() => {
        return currentTime.value && duration.value ? currentTime.value / duration.value * 100 : 0
    })

    let waitHandler = () => readyState.value = false,
        playHandler = () => readyState.value = true,
        timeHandler = () => currentTime.value = element.currentTime * 1000,
        loadHandler = () => duration.value = element.duration * 1000,
        errorHandler = event => {
            event.preventDefault()
            readyState.value = true
            console.error(event)
        }

    watchEffect(() => {
        if (src.value !== element.src) {
            element.src = src.value
            currentTime.value = 0
            readyState.value = element.readyState > 2
        }
    })

    onMounted(() => {
        readyState.value = element.readyState > 2
        element.addEventListener('timeupdate', timeHandler)
        element.addEventListener('canplaythrough', playHandler)
        element.addEventListener('waiting', waitHandler)
        element.addEventListener('loadeddata', loadHandler)
        element.addEventListener('error', errorHandler)
    })

    onUnmounted(() => {
        element.removeEventListener('timeupdate', timeHandler)
        element.removeEventListener('canplay', playHandler)
        element.removeEventListener('waiting', waitHandler)
        element.removeEventListener('loadeddata', loadHandler)
        element.removeEventListener('error', errorHandler)
        console.log('onUnmounted video')
    })

    return {src, element, currentTime, progress, duration, ready: readyState, playing, videoEvents}
}