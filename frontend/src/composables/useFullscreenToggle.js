import {ref} from "vue";

export default function useFullscreenToggle(fullscreenElement = ref()) {
    const toggleFullscreen = (element = fullscreenElement) => {
        document.fullscreenElement === element.value
            ? document.exitFullscreen()
            : element.value?.requestFullscreen()
    }
    return {fullscreenElement, toggleFullscreen}
}