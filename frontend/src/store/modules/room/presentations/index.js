import presentationApi from "@/api/presentation"
import draw from "./draw";
import PresentationsReducer from "@/api/application/reducers/PresentationsReducer";

const DEFAULT_PRESENTATION_ALIAS = 0

export default {
    namespaced: true,
    modules: {draw},
    state: () => ({
        list: [],
        current: undefined,
        strict: undefined,
    }),
    getters: {
        currentPresentation: state => state.list.find(i => i.id === state.current && i.activity),
        defaultPresentation: state => state.list.find(i => i.default),
        hasCurrentPresentation: (state, getters) => Boolean(getters["currentPresentation"]?.activity),
        hasDefaultPresentation: (state, getters) => Boolean(getters["defaultPresentation"]),
        presentationsList: state => state.list.filter(i => i.default !== 1),
    },
    actions: {
        initModule: {
            root: true,
            handler: (context, {presentations}) => {
            const list = presentations;
            const current = context.rootGetters["room/settings/currentPresentationId"];
            const strict = context.rootGetters["room/settings/presentationStrictMode"];
            context.commit('hydrate', {list, current, strict})
            }
        },
        currentPresentation: (context, presentationId) => {
            const slideIndex = context.state.list.find(i => i.id === presentationId)?.slideIndex || 1
            return context.dispatch("selectPresentation", {presentationId, slideIndex})
        },
        currentPresentationSlide: (context, slideIndex) => {
            const presentationId = context.state.current
            return context.dispatch("selectPresentation", {presentationId, slideIndex})
        },

        selectPresentation: (context, {presentationId, slideIndex}) => {
            return presentationApi.selectPresentation(presentationId, slideIndex)
        },

        eventRoomPresentationSelect: {
            root: true,
            handler: ({commit}, {data: {slideIndex, presentationId}}) => {
                commit("presentationSelect", {presentationId, slideIndex})
            }
        },
        eventRoomPresentationDelete: {
            root: true,
            handler: ({commit}, {data}) => commit('presentationDelete', {presentationId: data['deletedId']})
        },
        eventRoomPresentationUpdate: {
            root: true,
            handler: ({commit}, {data: {presentation}}) => commit('presentationCreate', presentation)
        },
        eventRoomPresentationToggle: {
            root: true,
            handler: ({commit}, {data}) => commit('presentationToggle', {presentationId: data['id'], ...data})
        }
    },

    mutations: {
        hydrate(state, payload) {
            state.list = Object.values(payload.list || {});
            state.current = payload.current;
            state.strict = payload.strict;
        },
        currentPresentation: (state, id) => state.current = Number(id),
        currentPresentationSlide: (state, slide) => {
            state.current
                ? state.list.find(i => i.id === state.current).slideIndex = slide || 1
                : state.list.find(i => i.default).slideIndex = slide || 1
        },
        presentationSelect(state, {presentationId, slideIndex}) {
            if (DEFAULT_PRESENTATION_ALIAS !== (state.current = presentationId)) {
                state.list.find(i => i.id === presentationId).slideIndex = Number(slideIndex)
            }
        },
        presentationDelete(state, {presentationId}) {
            state.list = state.list.filter(i => i.id !== presentationId)
        },
        presentationCreate(state, presentation) {
            state.list.push(PresentationsReducer.reducePresentation(presentation))
        },
        presentationToggle(state, {presentationId, activity}) {
            state.list.find(i => i.id === presentationId).activity = activity
        },

        presentationUpdate(state, presentation) {
            presentation = PresentationsReducer.reducePresentation(presentation)
            state.list = [...state.list.filter(i => i.id !== presentation.id), presentation]
        },

    },
}