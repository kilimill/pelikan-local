/**
 * Стейт для рисунков на презентациях
 */
export default {
    namespaced: true,
    state: () => ({
        actions: [],
    }),
    getters: {
        findDrawActions: state => (presentationId, slideIndex) => {
            return state.actions
                .find(i => i.presentationId === presentationId && i.slideIndex === slideIndex)?.drawActions
        },
        hasDrawActions: (state, getters) => (presentationId, slideIndex) => {
            let drawActions = getters["findDrawActions"](presentationId, slideIndex)
            return drawActions !== undefined && drawActions.length > 0
        },
    },

    actions: {
        initModule: {
            root: true,
            handler: (content, {drawActions}) => content.commit("hydrate", drawActions)
        },
        eventRoomPresentationCanvasActionDraw: {
            root: true,
            handler: ({commit}, {data}) => commit("drawAction", data)
        },
        eventRoomPresentationCanvasActionUndo: {
            root: true,
            handler: ({commit}, {data}) => commit("undoAction", data)
        },
        eventRoomPresentationCanvasActionDelete: {
            root: true,
            handler: ({commit}, {data}) => commit("deleteActions", data)
        }
    },

    mutations: {
        hydrate(state, payload) {
            state.actions = Object.values(payload || {})
        },
        drawAction(state, {presentationId, slideIndex, pointsData}) {
            let existsAction = state.actions
                .find(i => i.presentationId === presentationId && i.slideIndex === slideIndex)
            let drawAction = {...pointsData.settings, path: pointsData.coords}

            if (existsAction) {
                existsAction.drawActions.push(drawAction)
            } else {
                state.actions.push({presentationId, slideIndex, drawActions: [drawAction]})
            }
        },
        undoAction(state, {presentationId, slideIndex}) {
            let actionIndex = state.actions
                .findIndex(i => i.presentationId === presentationId && i.slideIndex === slideIndex)
            let drawActions = state.actions[actionIndex].drawActions

            if (~actionIndex && drawActions.length) {
                state.actions[actionIndex].drawActions = [...drawActions.slice(0, drawActions.length - 1)]
            }
        },
        deleteActions(state, {presentationId, slideIndex}) {
            let actionIndex = state.actions
                .findIndex(i => i.presentationId === presentationId && i.slideIndex === slideIndex)
            if (~actionIndex) {
                state.actions[actionIndex].drawActions = []
            }
        }
    }
}