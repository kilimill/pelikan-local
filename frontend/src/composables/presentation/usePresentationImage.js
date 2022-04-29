import {computed} from "vue";
import {useStore} from "vuex";
import useActivePresentation from "@/composables/room/presentations/useActivePresentation";
import useApplicationMode from "@/composables/useApplicationMode";

export default function usePresentationImage() {
    const store = useStore()
    const {currentPresentation} = useActivePresentation()
    const {isActivity} = useApplicationMode()

    const currentImage = computed(() => {
        const room = store.state.room.id
        const host = isActivity()
            ? store.state.application.config.hostInfo
            : store.state.application.config.storageInfo

        if (currentPresentation.value) {
            const presentation = currentPresentation.value.id
            const slide = (currentPresentation.value.slideIndex - 1).toString()
            return `${host}/pdf/${room}/${presentation}/page_${slide.padStart(4, '0')}.jpeg`
        }

        return  undefined
    })

    const defaultImage = computed(() =>
        store.state.application.config.hostInfo +
        store.state.application.config.defaultSlideUrl
    )

    const presentationImage = computed(() => currentImage.value || defaultImage.value)

    return {presentationImage, currentImage, defaultImage}
}