import useBrushTool from "@/composables/draw/useBrushTool";
import {computed, ref} from "vue";

export default function useDrawTools(states) {
    const activeToolName = ref('brush')
    const availableTools = {
        brush: useBrushTool,
    }
    const activeTool = computed(() => availableTools[activeToolName.value]())
    //const states = ref([])

    const clear = canvas => {
        if (canvas instanceof HTMLCanvasElement) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    const redraw = (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
            clear(canvas)
            states.value.forEach(state => {
                let currentTool = availableTools[state['tool']]()
                currentTool.tool.value = state
                currentTool.startDraw(canvas)
                currentTool.fillState(state)
                currentTool.draw()
                currentTool.release()
            })
        }
    }

    const drawCurrent = (x, y) => {
        activeTool.value.pushState({x, y})
        activeTool.value.draw()
    }

    return {
        states,
        activeTool,
        redraw,
        clear,
        startDraw: (canvas) => activeTool.value.startDraw(canvas),
        stopDraw: () => {
            if (activeTool.value.isDraw.value) {
                return {tool: activeToolName.value, ...activeTool.value.release()}
            }
        },
        draw: (x, y) => activeTool.value.isDraw.value ? drawCurrent(x, y) : undefined,
    }
}