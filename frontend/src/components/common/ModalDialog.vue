<template>
  <teleport to="body">
    <div class="modal fade" tabindex="-1" ref="modalDialog">
      <div class="modal-dialog" :class="dialogClassList" v-bind="dialogProperties">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><slot name="modal-title"></slot></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"><slot name="modal-body"></slot></div>
          <div class="modal-footer">
            <slot name="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import useBootstrapModal from "@/composables/bootstrap/useBootstrapModal";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {mapKeys, kebabCase} from "lodash";

const eventTypes = ['show', 'hide', 'shown', 'hidden']

export default {
  name: "ModalDialog",
  props: {
    scrollable: Boolean,
    centered: Boolean,
    fullscreen: Boolean,
    backdrop: Boolean,
  },
  emits: eventTypes,
  setup(props, {emit}) {
    const modalDialog = ref()
    const {showModal} = useBootstrapModal(modalDialog)
    const emitter = (event) => emit(event.type.replace(/\..+$/, ''))

    const dialogClassList = computed(() => mapKeys({
      modalDialogScrollable: props.scrollable,
      modalDialogCentered: props.centered,
      modalFullscreen: props.fullscreen,
    }, (value, key) => kebabCase(key)))

    const dialogProperties = computed(() => props.backdrop ? mapKeys({
      dataBsBackdrop: "static",
    }, (value, key) => kebabCase(key)) : {})

    onMounted(() => {
      eventTypes.forEach(type => modalDialog.value.addEventListener(`${type}.bs.modal`, emitter))
    })

    onBeforeUnmount(() => {
      eventTypes.forEach(type => modalDialog.value.removeEventListener(`${type}.bs.modal`, emitter))
    })

    return {
      modalDialog,
      showModal,
      dialogClassList,
      dialogProperties,
    }
  },
  /**
   * Public methods
   */
  methods: {
    show() {
      this.showModal = true
    },
    hide() {
      this.showModal = false
    },
    on(event, handler) {
      if (eventTypes.includes(event)) {
        this.$refs.modalDialog.addEventListener(`${event}.bs.modal`, handler)
      }
    },
    off(event, handler) {
      this.$refs.modalDialog?.removeEventListener(`${event}.bs.modal`, handler)
    }
  }
}
</script>

<style scoped lang="scss">
</style>