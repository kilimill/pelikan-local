import {computed, reactive, ref, unref} from "vue";
import useColorTools from "@/composables/draw/useColorTools";

export default function useBrushTool() {
    const isDraw = ref(false)
    const tool = reactive({opacity: 75, size: 10, color: 0x000000})
    const toolDecorator = computed({
        get: () => tool,
        set: vl => {
            tool.opacity = vl.opacity
            tool.size = vl.size
            tool.color = vl.color
        }
    })

    const {parseColor} = useColorTools()

    const privateDrawingContext = {
        canvas: undefined,
        screen: undefined,
        rect: {width: undefined, height: undefined},
        path: []
    }

    /**
     * @param {HTMLCanvasElement} canvas
     */
    const startDraw = (canvas) => {
        privateDrawingContext.canvas = canvas
        privateDrawingContext.path = []
        privateDrawingContext.rect.width = canvas.width
        privateDrawingContext.rect.height = canvas.height

        privateDrawingContext.screen = canvas.getContext('2d')
            .getImageData(0, 0, canvas.width, canvas.height)
        isDraw.value = true
    }

    /**
     * @return {{path: {x: number, y: number}[], size: number, color: number, opacity: number}}
     */
    const release = () => {
        privateDrawingContext.canvas = undefined
        privateDrawingContext.screen = undefined
        isDraw.value = false
        return {
            opacity: unref(tool.opacity),
            size: unref(tool.size),
            color: unref(tool.color),
            path: privateDrawingContext.path.splice(0, privateDrawingContext.path.length).map(i => ({
                x: parseFloat((i.x / privateDrawingContext.rect.width * 100).toFixed(2)),
                y: parseFloat((i.y / privateDrawingContext.rect.height * 100).toFixed(2)),
            }))
        }
    }

    return {
        startDraw,
        release,
        isDraw,
        tool: toolDecorator,
        pushState: ({x, y}) => privateDrawingContext.path.push({x, y}),
        fillState: ({path}) => privateDrawingContext.path = Array.isArray(path) ? [...path.map(i => ({
            x: privateDrawingContext.rect.width / 100 * i.x,
            y: privateDrawingContext.rect.height / 100 * i.y,
        }))] : [],

        draw() {
            let canvasContext = privateDrawingContext.canvas.getContext('2d'),
                rect = privateDrawingContext.rect
            canvasContext.clearRect(0, 0, rect.width, rect.height)
            canvasContext.putImageData(privateDrawingContext.screen, 0, 0)
            canvasContext.strokeStyle = parseColor(tool.color, tool.opacity)
            canvasContext.lineWidth = tool.size
            canvasContext.lineCap = "round"
            canvasContext.lineJoin = "round"

            canvasContext.beginPath()
            privateDrawingContext.path.forEach(i => canvasContext.lineTo(i.x, i.y))
            canvasContext.stroke()
            canvasContext.closePath()
        }
    }
}