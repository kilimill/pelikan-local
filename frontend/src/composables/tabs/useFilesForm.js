import {onBeforeUnmount, onMounted, ref} from "vue";

export default function useFilesForm(requestMethod, formElement = ref()) {
    const formLoading = ref(false)
    const fileInput = ref()

    const errorHandlers = []
    const handleError = message => errorHandlers.forEach(i => i(message))

    const inputHandler = ({target: {files: fileList}}) => {
        if (fileList.length) {
            const formData = new FormData(formElement.value)
            formLoading.value = true
            requestMethod(formData).then(response => {
                if (response.data.success !== true) {
                    handleError(response.data.text)
                }
                formElement.value.reset()
            }).catch(reason => handleError(reason.message))
                .finally(() => formLoading.value = false)
        }
    }

    onMounted(() => fileInput.value?.addEventListener('change', inputHandler))
    onBeforeUnmount(() => fileInput.value?.removeEventListener('change', inputHandler))

    return {
        formElement,
        formLoading,
        fileInput,
        setErrorHandler: handler => errorHandlers.push(handler),
    }
}