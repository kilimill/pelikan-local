<template>
  <div class="video-controls" ref="rootElement">
    <div class="video-player-panel">
      <button v-show="isSmallPlace" @click="switchPlaces" class="btn switch-places" data-bs-title="Смотреть в большом окне">
        <span class="material-icons">switch_video</span>
      </button>
      <button class="btn full-screen" data-bs-title="На весь экран" @click="fullScreen">
        <span class="material-icons">fullscreen</span>
      </button>
    </div>
  </div>
</template>

<script>
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";
import {computed, onMounted, ref} from "vue";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";

export default {
  name: "VideoControls",
  props: {placement: String},
  emits: ['fullscreen'],
  setup(props, {emit}) {
    const {isLargePlace, isSmallPlace, switchPlaces} = usePlacesInjection(computed(() => props.placement))
    const rootElement = ref()

    onMounted(() => useBootstrapTooltip(rootElement, "[data-bs-title]"))

    return {
      switchPlaces,
      isSmallPlace,
      isLargePlace,
      rootElement,
      fullScreen: () => emit('fullscreen'),
    }
  }
}
</script>

<style scoped lang="scss">
.video-controls {
  /*position: absolute;
  right: 0;
  bottom: 0;
  padding: 10px;
  z-index: 1001;*/

  button {
    color: #fff;
    cursor: pointer;
    font-size: 1.3em;
    padding: 0 5px;
    &:hover { color: #aaa; }
    &:focus { box-shadow: none; }
  }
}
</style>