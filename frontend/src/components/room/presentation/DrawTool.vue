<template>
  <button ref="button" v-bind="$attrs" @click="togglePalette" :class="{highlight:showPalette}">
    <slot></slot>
  </button>
  <div class="palette-holder" v-if="showPalette">
    <div class="btn-group palette-buttons" role="group">
      <div class="btn-group dropup select-brush">
        <button type="button" class="btn btn-outline-secondary"
                data-bs-toggle="dropdown" aria-expanded="false">
          <span class="material-icons-outlined">brush</span>
        </button>
        <ul class="dropdown-menu">
          <li v-for="size of sizes" :key="size">
            <button type="button" class="dropdown-item"
                    @click="brush.size = size"
                    :class="{active:brush.size === size}"
            >{{ size }}px
            </button>
          </li>
        </ul>
      </div>

      <div class="btn-group dropup select-color">
        <button type="button" class="btn btn-outline-secondary"
                data-bs-toggle="dropdown" aria-expanded="false">
          <span class="material-icons" :style="{color: brushColor}">format_color_fill</span>
        </button>
        <ul class="dropdown-menu">
          <li v-for="color in palette" :key="color">
            <button class="dropdown-item"
                    :class="{active:brush.color === color}"
                    @click="brush.color=color">
              <span class="color-square" :style="{background:parseColor(color)}"></span>
            </button>
          </li>
        </ul>
      </div>

      <div class="btn-group dropup select-opacity">
        <button type="button" class="btn btn-outline-secondary"
                data-bs-toggle="dropdown" aria-expanded="false"
        >{{ brush.opacity }}%
        </button>
        <ul class="dropdown-menu">
          <li v-for="opacity of opacities" :key="opacity">
            <button class="dropdown-item"
                    :class="{active:brush.opacity === opacity}"
                    @click="brush.opacity=opacity"
            >{{ opacity }}%
            </button>
          </li>
        </ul>
      </div>


      <button type="button" class="btn btn-outline-secondary" :disabled="!hasActions" @click="undoAction">
        <span class="material-icons">undo</span></button>
      <button type="button" class="btn btn-outline-secondary" :disabled="!hasActions" @click="deleteAction">
        <span class="material-icons-outlined">cancel</span>
      </button>
    </div>
  </div>
</template>

<script>
import {computed, readonly, ref} from "vue";
import useBrushTool from "@/composables/draw/useBrushTool";
import useColorTools from "@/composables/draw/useColorTools";
import {useStore} from "vuex";
import drawApi from "@/api/draw"
import useActivePresentation from "@/composables/room/presentations/useActivePresentation";

export default {
  name: "DrawTool",
  emits: ['select-tool'],

  setup() {
    const store = useStore()
    const {parseColor, palette, opacities} = useColorTools()
    const brushTool = useBrushTool()
    const {activePresentation} = useActivePresentation()

    const hasActions = computed(() =>
        activePresentation.value ? store.getters["room/presentations/draw/hasDrawActions"](
            activePresentation.value.id,
            activePresentation.value.slideIndex
        ) : undefined
    )

    const undoAction = () => activePresentation.value ? drawApi.undo(
        activePresentation.value.id, activePresentation.value.slideIndex
    ) : undefined

    const deleteAction = () => activePresentation.value ? drawApi.delete(
        activePresentation.value.id, activePresentation.value.slideIndex
    ) : undefined

    return {
      palette,
      opacities,
      parseColor,
      hasActions,
      undoAction,
      deleteAction,
      brush: brushTool.tool,
      sizes: [5, 10, 20, 40],
      showPalette: ref(false),
    }
  },

  computed: {
    brushColor() {
      return this.parseColor(this.brush.color)
    },
  },

  methods: {
    togglePalette() {
      if (false === (this.showPalette = !this.showPalette)) {
        this.$emit('select-tool', undefined)
      } else this.$emit('select-tool', readonly(this.brush))
    },
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/scss/theme";

button.highlight {
  color: $highlight;
}

.palette-holder {
  $item-with: 43px;

  background-color: rgba($light-gray, .7);
  display: flex;
  position: absolute;
  bottom: 55px;
  right: 0;

  .btn {
    font-size: 1.1em
  }

  .dropdown-menu {
    font-size: 0.8rem;
    min-width: 100%;
    text-align: center;

    .dropdown-item {
      padding: 0.25rem 0;
    }
  }

  .select-opacity {
    font-size: 0.6em;

    .btn {
      width: $item-with;
      padding-left: 0;
      padding-right: 0;
    }
  }

  .select-color {
    width: $item-with; // Что-то непонятное с dropdown

    .dropdown-menu {
      background-color: darken($dropdown-bg, 10)
    }

    .color-square {
      width: 1em;
      height: 1em;
      display: inline-block;
      border: $dropdown-border-width solid $dropdown-border-color;
    }
  }
}
</style>