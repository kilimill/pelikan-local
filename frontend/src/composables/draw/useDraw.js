import {computed, ref, watch} from "vue";
import useDrawTools from "@/composables/draw/useDrawTools";
import drawApi from "@/api/draw";
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";
import waitCanvas from "@/composables/draw/waitCanvas";

export default function useDraw(drawTool, presentation, drawActions) {
    const hasTool = computed(() => drawTool.value !== undefined)
    const {setTimeout} = useTimeoutSingleton()
    const {activeTool, startDraw, stopDraw, draw, redraw, clear} = useDrawTools(drawActions)
    const canvasElement = ref(), containerElement = ref()
    const redrawTimeout = (timeout = 200) => setTimeout(() => redraw(canvasElement.value), timeout)

    const startDrawAction = () => {
        if (hasTool.value) {
            startDraw(canvasElement.value)
        }
    }

    const stopDrawAction = () => {
        let toolRelease = hasTool.value ? stopDraw() : undefined

        if (toolRelease !== undefined) {
            drawApi.draw(presentation.value.id, presentation.value.slideIndex, toolRelease)
                .catch(reason => console.error(reason))
        }
    }

    watch(drawTool, value => {
        activeTool.value.tool.value = value ? value : activeTool.value.tool.value
    }, {deep: true})

    watch(drawActions, () => waitCanvas(canvasElement.value).then(c => redraw(c)), {deep: true})

    return {
        canvasElement,
        containerElement,
        hasTool,
        activeTool,
        startDrawAction,
        stopDrawAction,
        draw,
        redrawTimeout,
        redraw: () => redraw(canvasElement.value),
        clear: () => clear(canvasElement.value),
    }
}