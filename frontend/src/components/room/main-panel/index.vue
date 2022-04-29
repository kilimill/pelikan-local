<template>
  <div class="content-holder" :class="`content-holder--${placement}`" v-bind="$attrs">
    <div class="select-holder" v-if="currentUser.isHost"
         :class="`select-holder--${placement} value-${selectedContentValue}`">
      <drop-down-select class="select-content" :options="availableContentValues" v-model="selectedContentValue"/>
    </div>
    <component :is="currentComponent" @components-data="componentsDataEventHandler($event)"/>

    <modal-window ref="modalScreenCaptureDenial"
                  id="modalScreenCaptureDenial"
                  type="alert"
                  :name="modal.name"
                  @modal-result="modalResultHandler($event)">
      <template v-slot:message>Рабочий стол невозможно транслировать, если трансляция не активна!</template>
      <template v-slot:button-text-cancel>Завершить</template>
    </modal-window>
  </div>
</template>

<script>
import Board from '@/components/room/Board'
import DropDownSelect from '@/components/common/DropDownSelect'
import {mapGetters, mapMutations, useStore} from 'vuex'
import {computed, provide} from 'vue'
import useMainPanelContent from "@/composables/room/useMainPanelContent";
import useMainPanelComponents, {components} from "@/composables/room/useMainPanelComponents";
import ModalWindow from '@/components/common/ModalWindow'
import roomApi from "@/api/room";
import {Janus} from 'janus-gateway';

export default {
  name: 'MainPanel',
  props: {placement: String},
  components: {...components, Board, DropDownSelect, ModalWindow},
  setup(props) {
    const store = useStore();
    const events = computed(() => store.state.application.constants.events);
    const currentUser = computed(() => store.getters['user/currentUser']);
    const currentRoom = computed(() => store.getters['room/currentRoom']);
    const {selectedContentValue, availableContentValues} = useMainPanelContent()
    const {currentComponent, resetScreenCapture} = useMainPanelComponents()

    provide('placement', computed(() => props.placement))

    return {
      events, currentUser, currentRoom,
      currentComponent,
      selectedContentValue,
      availableContentValues,
      resetScreenCapture,
    };
  },
  data() {
    return {
      modal: {
        name: "modalScreenCaptureDenial",
        result: undefined
      }
    }
  },
  computed: {
    ...mapGetters('application', [
      'constants',
    ]),
    ...mapGetters('room/settings', [
      'currentPresentationId',
      'screenCaptureActive',
    ]),
    ...mapGetters('media', [
      'mediaStreamScreen',
    ]),
    showScreenCaptureDenialModal() {
      return this.currentUser.isHost && !this.currentRoom.isActive;
    },
  },
  watch: {
    selectedContentValue(newVal, oldVal) {

      if (
          oldVal === 'desktop' &&
          newVal !== undefined &&
          this.currentUser.isHost &&
          this.screenCaptureActive
      ) {
        Janus.stopAllTracks(this.mediaStreamScreen);
        this.setMediaStreamScreen(undefined);
        roomApi.toggleScreenCapture(false);
      }
      if (newVal === 'desktop') {
        if (this.showScreenCaptureDenialModal) {
          this.$refs.modalScreenCaptureDenial.show();
          this.selectedContentValue = oldVal
        }
      }
    },
  },
  methods: {
    ...mapMutations('media', [
      'setMediaStreamScreen',
    ]),
    componentsDataEventHandler(data) {
      let name = data.component;
      let event = data.event;

      if (name === 'ScreenCapture' && event === 'error') {
        // ... nothing to here
      }
    },

    modalResultHandler(data) {
      if (data.name === "modalScreenCaptureDenial") {
        this.resetScreenCapture()
      }
    },
  },
};
</script>

<style src="../../../assets/scss/external/main-panel.scss" lang="scss"/>

<style scoped lang="scss">
$content-offset: 10px;

.content-holder {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  background-color: lightgray;

  &--small, &--tab {
    .select-holder {
      position: relative;
      width: 100%;
    }
  }

  &--tab {
    background-color: transparent;
  }

  &--large {
    .select-holder {
      display: flex;
      justify-content: flex-start;
      background-color: transparent;
      padding: 10px 10px 0;
      width: 100%;

      &.value-desktop {
        position: absolute;
        padding: 0;
        left: 10px;
        top: 10px;
      }

      .select-content {
        width: auto;
      }

      .select-content {
        max-width: 400px
      }
    }
  }
}

.select-holder {
  z-index: 1001;
}

.select-content {
  z-index: 1001;
}
</style>