<template>
  <modal-dialog ref="modalDialog">
    <template v-slot:modal-title>
      <slot name="title">Требуется подтверждение</slot>
    </template>
    <template v-slot:modal-body>
      <slot name="message">Вы уверены?</slot>
    </template>
    <template v-slot:modal-footer>
      <button name="confirm" type="button" class="btn btn-danger" @click="confirmed">
        <slot name="confirm-text">Подтвердить</slot>
      </button>
      <button name="cancel" type="button" class="btn btn-default" @click="canceled">
        <slot name="cancel-text">Отмена</slot>
      </button>
    </template>
  </modal-dialog>
</template>

<script>
import ModalDialog from "@/components/common/ModalDialog";
import {getCurrentInstance, onMounted, ref, watch} from "vue";

const modalEvents = ['hide', 'show', 'hidden', 'shown']

export default {
  name: "ModalConfirm",
  components: {ModalDialog},
  props: ['confirm'],
  emits: ['update:confirm', 'confirmed', 'canceled', ...modalEvents],
  setup(props, {emit}) {
    const modalDialog = ref()
    const currentInstance = getCurrentInstance()

    const confirmed = () => {
      emit('confirmed', props.confirm)
      modalDialog.value.hide()
    }

    const canceled = () => {
      emit('canceled', props.confirm)
      modalDialog.value.hide()
    }

    watch(() => props.confirm, value => {
      currentInstance.isMounted && value
          ? modalDialog.value.show()
          : modalDialog.value.hide()
    })

    onMounted(() => {
      modalEvents.forEach(e => modalDialog.value.on(e, () => emit(e)))
      modalDialog.value.on('hidden', () => emit('update:confirm', undefined))
    })

    return {modalDialog, confirmed, canceled}
  }
}
</script>

<style scoped>

</style>