<template>
    <canvas ref="canvasElement"></canvas>
</template>

<script>
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import useImageLoader from "@/composables/presentation/useImageLoader";
import useResizeObserver from "@/composables/useResizeObserver";
import {debounce} from "lodash/function";

export default {
  name: "CanvasImage",
  props: { image: String, parent: String },
  emits: ['image-ready'],
  setup(properties, {emit}) {
    /**
     * @var {Ref<Image>} imageRef
     * @var {Ref<HTMLElement>} parentRef
     * @var {Ref<HTMLCanvasElement>} canvasElement
     */
    const imageRef = ref(), canvasElement = ref(), parentRef = ref()
    const imageReady = ref(false)
    const propertyImage = computed(() => properties.image)
    const {loadImage} = useImageLoader()
    const {handleResize} = useResizeObserver()

    const drawImage = () => {
      if (canvasElement.value && parentRef.value && imageRef.value && imageReady.value) {
        let canvasContext = canvasElement.value.getContext('2d'),
            parentElement = parentRef.value, imageElement = imageRef.value,
            aspectRatio

        canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height)
        canvasContext.canvas.width = canvasContext.canvas.height = undefined

        aspectRatio = Math.min(
            parentElement.clientWidth / imageElement.width,
            parentElement.clientHeight / imageElement.height,
        )

        canvasContext.canvas.width = Math.floor(imageElement.width * aspectRatio)
        canvasContext.canvas.height = Math.floor(imageElement.height * aspectRatio)
        canvasContext.drawImage(imageElement, 0, 0, canvasContext.canvas.width, canvasContext.canvas.height)
      }
    }, drawDebounced = debounce(drawImage, 50, {leading: true})

    onMounted(() => {
      parentRef.value = properties.parent
          ? canvasElement.value.closest(properties.parent)
          : canvasElement.value.parentElement

      watch(propertyImage, url => {
        emit('image-ready', imageReady.value = false)
        loadImage(url).then(({image}) => {
          imageRef.value = image
          emit('image-ready', imageReady.value = true)
          drawImage()
        }).catch(reason => console.error({url, reason}))
      }, {immediate: true})

      handleResize(parentRef.value, drawImage)
      window.addEventListener('resize', drawDebounced, {passive: true})
    })

    onBeforeUnmount(() => window.removeEventListener('resize', drawDebounced))

    return {imageReady, canvasElement}
  }
}
</script>

<style scoped>
  canvas {
    max-width: 100%;
    max-height: 100%;
  }
</style>