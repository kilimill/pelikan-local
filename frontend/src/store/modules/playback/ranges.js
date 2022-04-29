const typesAll = [
    "host",
    "called",
    "screen"
];

export default {
    namespaced: true,
    state: () => ({
        list: [],
        active: {
            host: undefined,
            called: undefined,
            screen: undefined,
        }
    }),
    getters: {
        ranges(state) {
            return state.list;
        },
        activeRange(state) {
            return state.active;
        },
        activeRangesAll: state => (timeValue) => {
            return state.list.filter(r => (r.timeStart <= timeValue) && (r.timeEnd >= timeValue))
        },
        activeRangeHost(state) {
            return state.active.host;
        },
        activeRangeCalled(state) {
            return state.active.called;
        },
        activeRangeScreen(state) {
            return state.active.screen;
        }
    },
    actions: {
        initModule: {
            root: true,
            handler: (context, {ranges}) => context.commit("hydrate", ranges)
        },
        activeRange(context, {currentTime, mountPointId, type}) {
            let range = context.getters["activeRangesAll"](currentTime)
                .filter(r => r.mountpointId === mountPointId)
            console.error(type);
            context.commit('setActive', {type: type, range: range[0]})
            return range[0];
        },
        unsetRanges(context, {typesActive}) {
            let diff = typesAll.filter(t => !typesActive.includes(t))
            if (diff.length > 0) {
                for (const type of diff) {
                    context.commit("unsetActive", {type});
                }
            }
        }
    },
    mutations: {
        hydrate(state, payload) {
            payload = payload || []
            state.list = payload.sort((a, b) => a.index - b.index);
        },
        setActive(state, {type, range}) {
            state.active[type] = range;
        },
        unsetActive(state, {type}) {
            state.active[type] = undefined;
        }

    },
}