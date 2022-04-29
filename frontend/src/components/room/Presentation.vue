<template>
  <div id="canvas-wrapper" ref="canvasWrapper">
    <div id="canvas-area-wrapper" ref="canvasAreaWrapper">
      <draw-area class="canvas-cover" ref="canvasDraw" :draw-tool="drawTool" v-show="displayCanvas"/>
      <canvas-image :image="presentationImage" parent="#canvas-wrapper" v-show="displayCanvas"
                    @image-ready="displayCanvas = $event"/>
    </div>
  </div>
  <div class="content-controls presentation-controls" ref="presentationControls">
    <div id="presentation-paginator-block" v-show="showPagination && isLargePlace" class="btn-group" role="group">
      <button class="btn btn-outline-transparent"
              type="button" data-bs-title="В начало"
              @click="toFirstPage"
              :class="{disabled: !canPrevPage}"
      ><span class="material-icons">first_page</span></button>
      <button type="button" data-bs-title="Предыдущий"
              class="btn btn-outline-transparent"
              :class="{disabled: !canPrevPage}"
              @click="toPrevPage"
      ><span class="material-icons">keyboard_arrow_left</span></button>

      <span class="page-counter">
        <span v-text="currentPage"></span>
        <span>/</span>
        <span v-text="totalPages"></span>
      </span>

      <button type="button" data-bs-title="Следующий"
              class="btn btn-outline-transparent"
              :class="{disabled: !canNextPage}"
              @click="toNextPage"
      ><span class="material-icons">keyboard_arrow_right</span>
      </button>
      <button type="button" data-bs-title="В конец"
              class="btn btn-outline-transparent"
              :class="{disabled: !canNextPage}"
              @click="toLastPage"
      ><span class="material-icons">last_page</span></button>

    </div>
    <div id="presentation-actions-block" class="btn-group" role="group">
      <div class="btn-group" v-show="isLargePlace">
        <div class="btn-group" v-if="currentUser.isHost">
          <input type="checkbox" class="btn-check" id="presentation-strict-mode" autocomplete="off"
                 v-model="strictMode">
          <label class="btn btn-outline-transparent" for="presentation-strict-mode"
                 :data-bs-title="strictModeTitle">
            <span class="material-icons strict-mode--enabled">code</span>
            <span class="material-icons strict-mode--disabled">code_off</span>
          </label>
        </div>
        <draw-tool v-if="userCanDraw" @select-tool="toggleDrawMode"
                   class="btn btn-outline-transparent" type="button">
          <span class="material-icons">brush</span>
        </draw-tool>
      </div>
      <button v-show="isSmallPlace" @click="switchPlaces()"
              class="btn btn-outline-transparent" data-bs-title="Смотреть в большом окне">
        <span class="material-icons">switch_video</span>
      </button>
      <button class="btn btn-outline-transparent" type="button" data-bs-title="На весь экран"
              @click="toggleFullscreen()"
      ><span class="material-icons">fullscreen</span></button>
    </div>
  </div>
</template>

<script>
import {useStore} from 'vuex'
import {computed, ref} from "vue";
import DrawArea from "@/components/room/presentation/DrawArea";
import DrawTool from "@/components/room/presentation/DrawTool";
import CanvasImage from "@/components/room/presentation/CanvasImage";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import usePresentationImage from "@/composables/presentation/usePresentationImage";
import usePlacesInjection from "@/composables/room/room-places/usePlacesInjection";
import usePresentationPaging from "@/composables/presentation/usePresentationPaging";
import useFullscreenToggle from "@/composables/useFullscreenToggle";

export default {
  name: 'Presentation',
  components: {CanvasImage, DrawTool, DrawArea},
  active: true,
  emits: ['componentsData'],
  setup() {
    const store = useStore()
    const {presentationImage} = usePresentationImage()
    const {switchPlaces, isLargePlace, isSmallPlace} = usePlacesInjection()

    const currentUser = computed(() => store.getters["user/currentUser"]);
    const userCanDraw = computed(() => currentUser.value.isHost || currentUser.value.isCalled)

    const drawTool = ref(undefined)
    const presentationControls = ref()
    const canvasWrapper = ref()
    const {toggleFullscreen} = useFullscreenToggle(canvasWrapper)

    useBootstrapTooltip(presentationControls, "[data-bs-title]")

    return {
      drawTool,
      userCanDraw,
      canvasWrapper,
      presentationControls,
      presentationImage,
      currentUser,
      switchPlaces,
      isLargePlace,
      isSmallPlace,
      toggleFullscreen,
      ...usePresentationPaging(),
      toggleDrawMode: tool => drawTool.value = tool,
      displayCanvas: ref(false),
    }
  },
};
</script>

<style scoped lang="scss">
#canvas-wrapper {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: transparent;
  position: relative;

  [data-placement=small] & {
    min-height: 200px;
  }

  #canvas-area-wrapper {
    display: flex;
    position: relative;

    .canvas-cover {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .canvas-image {
      width: 100%;
      height: 100%;
    }
  }
}

#presentation-paginator-block {
  margin: 0 auto;
}

#presentation-actions-block {
  margin: 0;
  padding: 0;
}

input[type=checkbox]#presentation-strict-mode {
  &:not(:checked) + label .strict-mode--enabled {
    display: none
  }

  &:checked + label {
    background-color: transparent;

    .strict-mode--disabled {
      display: none
    }
  }
}

.presentation-controls {
  .page-counter {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>