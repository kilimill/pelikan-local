import usePresentationsList from "@/composables/room/presentations/usePresentationsList";
import useActivePresentation from "@/composables/room/presentations/useActivePresentation";

export default function usePresentations() {
    const {
        presentationsList,
        filteredPresentations,
        presentationsFilter,
        findPresentation,
    } = usePresentationsList()

    const {
        defaultPresentation,
        currentPresentation,
        activePresentation,
        selectPresentation,
        selectCurrentPresentation,
        slideCurrentPresentation,
    } = useActivePresentation()

    return {
        presentationsList,
        filteredPresentations,
        presentationsFilter,
        findPresentation,

        defaultPresentation,
        currentPresentation,
        activePresentation,
        selectPresentation,
        selectCurrentPresentation,
        slideCurrentPresentation,
    }
}