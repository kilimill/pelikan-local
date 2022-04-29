import videoEvents from "@/composables/playback/video/videoEvents";
import {onMounted, onUnmounted} from "vue";

/**
 *
 * @param {HTMLVideoElement} videoElement
 * @return {{}}
 */
export default function useVideoEvents(videoElement) {
    const handlers = {}
    const eventListener = event => handlers[event.type].forEach(h => h(event))

    videoEvents.forEach(eventType => handlers[eventType] = [])

    onMounted(() => {
        videoEvents.forEach(eventType => videoElement.addEventListener(eventType, eventListener))
    })

    onUnmounted(() => {
        videoEvents.forEach(eventType => handlers[eventType] = [])
        videoEvents.forEach(eventType => videoElement.removeEventListener(eventType, eventListener))
    })

    return {
        addEventListener: (type, handler) => {
            videoEvents.includes(type) ? handlers[type].push(handler) : null
            return handler
        },
        removeEventListener: (type, handler) => {
            const index = handlers[type].indexOf(handler)
            return ~index ? handlers[type].splice(index, 1)[0] : null
        }
    }
}