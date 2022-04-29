<template>
  <div class="miro-board" ref="miroBoardContainer">
    <iframe :src="outgoingURL" frameBorder="0" scrolling="no" allowFullScreen></iframe>
    <div class="content-controls">
      <div class="btn-group">
        <button v-show="isSmallPlace" @click="switchPlaces()"
                class="btn btn-outline-transparent" data-bs-title="Смотреть в большом окне">
          <span class="material-icons">switch_video</span>
        </button>
        <button class="btn btn-outline-transparent" type="button" data-bs-title="На весь экран"
                @click="toggleFullscreen()"
        ><span class="material-icons">fullscreen</span></button>
      </div>
    </div>
  </div>
</template>

<script>
import useActiveMiroBoard from "@/composables/room/miro-boards/useActiveMiroBoard";
import useMiroURLBuilder from "@/composables/room/miro-boards/UseMiroURLBuilder";
import {ref, watchEffect} from "vue";
import useFullscreenToggle from "@/composables/useFullscreenToggle";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";

export default {
  name: "MiroBoard",
  setup() {
    const {currentBoard} = useActiveMiroBoard()
    const {incomingURL, outgoingURL} = useMiroURLBuilder()
    const miroBoardContainer = ref()
    const {toggleFullscreen}  = useFullscreenToggle(miroBoardContainer)
    const {isSmallPlace, switchPlaces} = usePlacesInjection()

    watchEffect(() => incomingURL.value = currentBoard.value?.url)
    useBootstrapTooltip(miroBoardContainer, "[data-bs-title]")

    return {
      currentBoard,
      outgoingURL,
      miroBoardContainer,
      toggleFullscreen,
      isSmallPlace,
      switchPlaces,
    }
  },
}
</script>

<style scoped lang="scss">
  .miro-board {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    width: 100%;

    iframe {
      flex-grow: 1;
      border: none;
    }
  }
</style>