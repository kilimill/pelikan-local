export const
    PREDEFINED_CONTENT_DESKTOP = "desktop",
    PREDEFINED_CONTENT_BACKGROUND = "background",
    PREDEFINED_CONTENT_DEFAULT = PREDEFINED_CONTENT_BACKGROUND

const PREDEFINED_CONTENT_VALUES = [
    {name: "Заставка", value: PREDEFINED_CONTENT_BACKGROUND},
    {name: "Рабочий стол", value: PREDEFINED_CONTENT_DESKTOP},
]


const itemToSelectionValue = (id, type) => `${type}-${id}`
const presentationToValue = (presentation) => itemToSelectionValue(presentation.id, 'presentation')
const miroBoardToValue = (board) => itemToSelectionValue(board.id, 'board')

export default {
    namespaced: true,
    state: () => ({
        selectedValue: undefined,
        previousValue: undefined,
    }),
    getters: {
        selectedContentValue: (state, getters) => {
            return getters.availableContentValues.find(i => i.value === state.selectedValue)?.value
        },
        availableSelectedValue: (state, getters, rootState) => {
            const enabledScreenCapture = Boolean(rootState.room.settings.screenCaptureActive)
            const enabledBoardIsActive = Boolean(rootState.room.settings.boardIsActive)
            const roomHostIsJoined = Boolean(rootState.room.users.host)
            const currentPresentationId = Number(rootState.room.presentations.current)
            const activeMiroBoardId = Number(rootState.room.boards.active)

            const defaults = enabledBoardIsActive
                ? miroBoardToValue({id:activeMiroBoardId})
                : currentPresentationId
                    ? presentationToValue({id:currentPresentationId})
                    : PREDEFINED_CONTENT_BACKGROUND

            return (enabledScreenCapture && roomHostIsJoined) ? PREDEFINED_CONTENT_DESKTOP : defaults
        },
        availablePresentations: (sate, getters, rootState, rootGetters) => {
            return rootGetters["room/presentations/presentationsList"].filter(i => i.activity)
        },
        availableMiroBoards: (sate, getters, rootState) => {
           return rootState.room.boards.list.filter(i => i.enabled)
        },
        availableContentValues: (state, getters, rootState, rootGetters) => {
            const canScreenCapture = Boolean(rootGetters["room/currentRoom"].isWebCamRoom)
            const predefinedContent = PREDEFINED_CONTENT_VALUES.filter(i =>
                canScreenCapture || i.value !== PREDEFINED_CONTENT_DESKTOP
            )
            const presentationsList = getters.availablePresentations.map(i => {
                return {name: i.listName, value: presentationToValue(i)}
            })
            const miroBoardsList = getters.availableMiroBoards.map(i => {
                return {name: i.name, value: miroBoardToValue(i)}
            })

            return [
                ...predefinedContent,
                ...presentationsList,
                ...miroBoardsList,
            ]
        }
    },
    mutations: {
        selectedContentValue: (state, value) => {
            [state.previousValue, state.selectedValue] = [state.selectedValue, value]
        }
    },
}