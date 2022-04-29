import Presentation from "@/components/room/Presentation";
import ScreenCapture from "@/components/room/ScreenCapture";
import MiroBoard from "@/components/room/main-panel/MiroBoard";
import useMainPanelContent from "@/composables/room/useMainPanelContent";
import {PREDEFINED_CONTENT_BACKGROUND, PREDEFINED_CONTENT_DESKTOP} from "@/store/modules/room/content";
import {useStore} from "vuex";
import {computed, watch} from "vue";
import useActivePresentation from "@/composables/room/presentations/useActivePresentation";
import useMessageSubscription from "@/composables/useMessageSubscription";
import useActiveMiroBoard from "@/composables/room/miro-boards/useActiveMiroBoard";

export const components = {ScreenCapture, Presentation, MiroBoard}

export default function useMainPanelComponents() {
    const store = useStore()
    const currentUser = computed(() => store.getters["user/currentUser"])
    const message = useMessageSubscription(store.getters["application/getChannels"])
    const {availableContentValues, selectedContentValue, previousSelectedValue} = useMainPanelContent()
    const {selectCurrentPresentation} = useActivePresentation()
    const {selectBoard:selectCurrentMiroBoard} = useActiveMiroBoard()
    const isScreenCaptureValue = value => value === PREDEFINED_CONTENT_DESKTOP
    const isBackgroundValue = value => value === PREDEFINED_CONTENT_BACKGROUND
    const isPresentationValue = value => /^presentation-/.test(value) || isBackgroundValue(value)
    const isMiroBoardValue = value => /^board-/.test(value)
    const mediaScreenCapture = computed(() => store.getters["media/mediaStreamScreen"])

    const resetScreenCapture = () => {
        const previousValue = previousSelectedValue.value === PREDEFINED_CONTENT_DESKTOP
            ? undefined
            : previousSelectedValue.value
        const expression = new RegExp(`^${PREDEFINED_CONTENT_DESKTOP}$`)
        const replace = previousValue || PREDEFINED_CONTENT_BACKGROUND
        selectedContentValue.value = selectedContentValue.value?.replace(expression, replace)
    }

    const getComponentByValue = value => {
        return isScreenCaptureValue(value) ? ScreenCapture.name :
            isPresentationValue(value) ? Presentation.name :
                isMiroBoardValue(value) ? MiroBoard.name : undefined
    }

    const currentComponent = computed(() => getComponentByValue(selectedContentValue.value))

    if (currentUser.value.isHost) {
        watch(mediaScreenCapture, value => value === undefined ? resetScreenCapture() : undefined)
        watch(selectedContentValue, value => {
            const id = parseInt(String(value).replace(/\w+-?/, '0'))

            isPresentationValue(value) ? selectCurrentPresentation(id) :
                isMiroBoardValue(value) ? selectCurrentMiroBoard(id) : undefined
        })
        message.on("event.pause", () => resetScreenCapture())
    }

    return {
        currentComponent,
        availableContentValues,
        selectedContentValue,
        isScreenCaptureValue,
        resetScreenCapture,
    }
}