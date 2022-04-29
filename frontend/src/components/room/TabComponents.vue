<template>
  <div class="tabs">
    <nav ref="tabs">
      <div class="nav nav-tabs nav-justified" role="tablist">
        <button v-for="component of components" :key="component.name"
                type="button" class="nav-link" role="tab"
                :class="getComponentClasses(component)"
                :aria-selected="component.name === currentComponent.name"
                @click="setCurrentComponent(component)"
        ><span class="material-icons">{{component.icon}}</span>
        </button>
      </div>
    </nav>
    <div class="tabs-content">
      <component :is="currentComponent.name" v-bind="componentOptions"/>
    </div>
  </div>
</template>

<script>
import components from "@/store/modules/tabs/components";
import {ref, unref, watch} from "vue";
import useViewportMatcher from "@/composables/useViewportMatcher";
import useTabComponents from "@/composables/tabs/useTabComponents";


export default {
  name: "TabComponents",
  components,
  setup() {
    const {matchViewport} = useViewportMatcher('(max-width: 992px)')
    const {currentComponent, componentsList, toDefaultTab} = useTabComponents()

    watch(matchViewport, value => {
      if (!(currentComponent.value.visible || value)) {
        toDefaultTab()
      }
    })

    return {
      isSmallScreen: matchViewport,
      components: componentsList,
      currentComponent,
      componentOptions: ref({}),
    }
  },

  provide() {
    return {
      changeCurrentTab: (name, options) => {
        this.componentOptions = {...(options || {})}
        this.currentComponent = unref(name)
      }
    }
  },
  methods: {
    getComponentClasses(component) {
      return {
        active: this.currentComponent.name === component.name,
        highlight: component.highlight,
        'd-lg-none': !component.visible,
      }
    },
    setCurrentComponent({name}) {
      this.componentOptions = {}
      this.currentComponent = name
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/scss/theme";

.tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.nav-tabs {
  border-bottom-color: $middle-gray;

  .nav-link{
    border: none;
    color: $light;

    &.active {
      color: $light;
      background-color: $middle-gray;
    }

    &.highlight {
      color: $highlight;
    }

    .material-icons {
      font-size: 1.5rem;
    }
  }
}

.tabs-content {
  background-color: $middle-gray;
  display: flex;
  flex-grow:  1;
  flex-direction: column;
  overflow: hidden;

  .tab-content {
    display: flex;
    flex-direction: column;
  }
}
</style>

<!-- Стили в глобальной области видимости -->
<style lang="scss">
@import "src/assets/scss/theme";

.tabs-content > .tab-content {
  font-size: 15px;
  overflow: hidden;
  padding: 10px;
  text-align: start;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.btn-group.btn-group_tabs {
  display: block;
  width: 100%;
  .btn.btn-tab_button {width: 25%}
}
.btn.btn-tab_button {
  $background: $middle-gray;
  $border: darken($background, 10);
  $color: lighten($background, 20);
  $hover-color: lighten($color, 10);
  @include button-variant($background, $border, $color, $background, $border, $hover-color, $background, $border, $light);
  font-size: 1.5rem;
  padding: 2px 0;
}
</style>