import {onMounted, onUnmounted, ref, watch} from "vue";
import {Modal} from "bootstrap";

export default function useBootstrapModal(elementRef = ref(), options = {}) {
    const bootstrapRef = ref()
    const showModalRef = ref(false)

    onMounted(() => {
        bootstrapRef.value = new Modal(elementRef.value, options)
        elementRef.value.addEventListener('shown.bs.modal', () => showModalRef.value = true)
        elementRef.value.addEventListener('hidden.bs.modal', () => showModalRef.value = false)
    })

    onUnmounted(() => {
        bootstrapRef.value?.hide()
        bootstrapRef.value?.dispose()
        bootstrapRef.value = undefined
    })

    watch([showModalRef, bootstrapRef], ([showValue, bootstrapValue]) => {
        bootstrapValue ? showValue ? bootstrapValue.show() : bootstrapValue.hide() : undefined
    }, {immediate: true})

    return {showModal: showModalRef, modalElement: elementRef, toggleModal: () => bootstrapRef.value?.toggle()}
}