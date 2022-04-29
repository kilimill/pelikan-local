<template>
  <div class="draw-area" ref="container">
    <canvas ref="canvas" :class="{hasTool}"
            @mouseleave="stopDraw"
            @mouseup="stopDraw"
            @mousedown="startDraw"
            @mousemove="drawCurrent"
            v-show="showCanvas"
    ></canvas>
  </div>
</template>

<script>
import useResizeObserver from "@/composables/useResizeObserver";
import {computed, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import useDraw from "@/composables/draw/useDraw";
import useActivePresentation from "@/composables/room/presentations/useActivePresentation";
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";

export default {
  name: "DrawArea",
  props: {drawTool: Object},
  setup(properties) {
    const store = useStore()
    const {handleResize} = useResizeObserver()
    const drawTool = computed(() => properties.drawTool)
    const {activePresentation} = useActivePresentation()
    const {setTimeout} =useTimeoutSingleton()

    const drawActions = computed(() => store.getters["room/presentations/draw/findDrawActions"](
        activePresentation.value?.id,
        activePresentation.value?.slideIndex
    ) || [])

    const showCanvas = ref(false)
    const hideCanvas = (timeout = 200) => {
      showCanvas.value = timeout < 1
      setTimeout(() => showCanvas.value = true, timeout)
    }
    watch(activePresentation, () => hideCanvas(0), {immediate: true, deep: true})

    const {
      hasTool,
      startDrawAction,
      stopDrawAction,
      draw,
      redraw,
      canvasElement,
      containerElement,
    } = useDraw(drawTool, activePresentation, drawActions)

    onMounted(() => {
      handleResize(containerElement.value, rect => {
        canvasElement.value.width = rect.width
        canvasElement.value.height = rect.height
        rect.width && rect.height ? redraw() : undefined
      })
    })

    return {
      hasTool,
      showCanvas,
      canvas: canvasElement,
      container: containerElement,
      startDraw: startDrawAction,
      stopDraw: stopDrawAction,
      drawCurrent: ({offsetX, offsetY}) => draw(offsetX, offsetY),
    }
  },

  methods: {
    clear() {
      let canvasElement = this.$refs.canvas,
          canvasContext = canvasElement.getContext('2d')
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    },
  },
}
</script>

<style scoped lang="scss">
.draw-area {
  overflow: hidden;
  &, canvas {
    background: transparent;
    position: relative;
  }
}

.hasTool {
  cursor: url('../../../../src/assets/icons/ic_brush_24px.svg') 0 18, crosshair;
}
</style>