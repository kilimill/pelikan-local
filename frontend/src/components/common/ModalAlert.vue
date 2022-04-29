<template>
  <modal-dialog ref="modalDialog">
    <template v-slot:modal-title><slot name="title">Внимание!</slot></template>
    <template v-slot:modal-body><p>{{message}}</p></template>
    <template v-slot:modal-footer>
      <button name="close-button" type="button" class="btn btn-primary" @click.prevent="clearMessage">
        <slot name="button-text">ОК</slot>
      </button>
    </template>
  </modal-dialog>
</template>
<script>
import ModalDialog from "@/components/common/ModalDialog"
import {getCurrentInstance, onMounted, ref, watch} from "vue";

const modalEvents = ['hide', 'show', 'hidden', 'shown']

export default {
  name: "ModalAlert",
  components: {ModalDialog},
  props: {message: String},
  emits: ['update:message', ...modalEvents.map(i => `modal:${i}`)],
  setup(props, {emit}) {
    const modalDialog = ref()
    const currentInstance = getCurrentInstance()
    const clearMessage = () => emit('update:message', undefined)

    watch(() => props.message, value => {
      currentInstance.isMounted && value
          ? modalDialog.value?.show()
          : modalDialog.value?.hide()
    }, {immediate: true})

    onMounted(() => {
      modalEvents.forEach(e => modalDialog.value.on(e, () => emit(`modal:${e}`)))
      modalDialog.value.on('hidden', () => emit('update:message', undefined))
    })

    return {modalDialog, clearMessage}
  },
}
</script>

<style scoped>

</style>