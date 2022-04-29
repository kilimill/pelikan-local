import {onMounted, onUnmounted, reactive, ref, watch} from "vue";

export default function usePlaybackSeekbar() {
    const seeking = reactive({start: false, value: 0})
    const element = ref()

    const calculate = (event) => {
        let
            clientX = event.clientX,
            width = element.value?.offsetWidth,
            value = Math.max(0, clientX - element.value.offsetLeft) / width * 100
        return Math.min(100, value)
    }

    const mouse = {
        element: undefined,
        down(event) {
            event.preventDefault()
            mouse.element = event.target
            seeking.value = calculate(event)
            seeking.start = true
        },
        move(event) {
            if (seeking.start) {
                seeking.value = calculate(event)
            }
        },
        up(event) {
            if (seeking.start) {
                seeking.start = false
                seeking.value = calculate(event)
            }
        }
    }

    onMounted(() => {
        document.documentElement.addEventListener('mousemove', mouse.move, {passive: true})
        document.documentElement.addEventListener('mouseup', mouse.up, {passive: true})
        element.value.addEventListener('mousedown', mouse.down, {immediate: true})
    })
    onUnmounted(() => {
        document.documentElement.removeEventListener('mousemove', mouse.move)
        document.documentElement.removeEventListener('mouseup', mouse.up)
        element.value?.removeEventListener('mousedown', mouse.down)
    })

    watch(seeking, ({start, value}) => console.log({start, value}))

    return {
        seeking,
        element,
    }
}