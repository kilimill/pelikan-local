import {reactive, ref, toRaw} from "vue";
import miroBoardsApi from "@/api/miroBoards";

export default function useMiroForm() {

    const formFields = reactive({name: undefined, link: undefined})
    const formErrors = reactive({name: [], link: []})
    const formDisabled = ref(false)
    const disableForm = () => formDisabled.value = true
    const enableForm = () => formDisabled.value = false

    const clearErrors = (field) => field
        ? formErrors[field] ? formErrors[field] = [] : undefined
        : formErrors.link = formErrors.name = []

    const clearForm = () => {
        formFields.name = undefined
        formFields.link = undefined
        clearErrors()
    }

    const submitForm = () => {
        clearErrors()
        disableForm()

        return new Promise((resolve, reject) => {
            miroBoardsApi.create(toRaw(formFields)).then(response => {
                formErrors.name = response.data.errors?.name || [];
                formErrors.link = response.data.errors?.link || [];
                response.data.message === 'OK'
                    ? resolve(response.data.success)
                    : reject(response.data.message)
            }).catch(reason => reject(reason.response.data.message || reason.message))
        }).finally(enableForm)
    }

    return {formFields, formErrors, formDisabled, submitForm, clearErrors, clearForm}
}