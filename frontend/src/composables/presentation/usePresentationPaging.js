import useActivePresentation from "@/composables/room/presentations/useActivePresentation";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useCurrentUser from "@/composables/users/useCurrentUser";
import {computed} from "vue";

export default function usePresentationPaging() {
    const {
        currentPresentation,
        activePresentation,
        slideCurrentPresentation,
    } = useActivePresentation()

    const {roomEnableSwitchSlide} = useRoomSettings()
    const {isHost, isParticipant} = useCurrentUser()

    const selectPresentationSlide = index => hasPage(index)
        ? slideCurrentPresentation(index, isParticipant.value) : undefined

    const currentPage = computed(() => Number(activePresentation.value.slideIndex))
    const totalPages = computed(() => Number(activePresentation.value.pagesTotal))
    const hasPage = index => Boolean(index > 0 && index <= totalPages.value)
    const toPrevPage = () => selectPresentationSlide(currentPresentation.value.slideIndex - 1)
    const toNextPage = () => selectPresentationSlide(currentPresentation.value.slideIndex + 1)
    const toFirstPage = () => selectPresentationSlide(1)
    const toLastPage = () => selectPresentationSlide(totalPages.value)
    const canPrevPage = computed(() => currentPage.value > 1)
    const canNextPage = computed(() => currentPage.value < totalPages.value)
    const showPagination = computed(() => totalPages.value > 1 && (isHost.value || roomEnableSwitchSlide.value))


    return {
        currentPage,
        totalPages,
        canPrevPage,
        canNextPage,
        showPagination,
        toPrevPage, toNextPage,
        toFirstPage, toLastPage,
        toPage: index => selectPresentationSlide(index),
        /** @type {import("@vue/reactivity").ComputedRef<{id, slideIndex}>} */
        currentPresentation: computed(() => currentPresentation.value || {id: 0, slideIndex: 1}),
        strictMode: roomEnableSwitchSlide,
        strictModeTitle: computed(() => roomEnableSwitchSlide.value
            ? 'Запретить листать слайды'
            : 'Разрешить листать слайды')
    }
}