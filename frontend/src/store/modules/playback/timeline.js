/*import usePlaybackInterval from "@/composables/playback/usePlaybackInterval"

const {startInterval, stopInterval} = usePlaybackInterval()*/

export default {
    namespaced: true,

    state: () => ({
        current: 0,
        activeDuration: 0,
        isActive: false,
        manualSeekTriggered: false
    }),

    getters: {
        currentValue(state) {
            return state.current;
        },
        duration(state) {
            return state.activeDuration;
        },
        active(state) {
            return state.isActive;
        },
        manualSeek(state) {
            return state.manualSeekTriggered;
        },
    isAtStart(state){
      return state.current === 0;
    },
    isAtEnd(state){
      return state.current === state.activeDuration;
    }},
    actions: {
        initModule: {
            root: true,
            handler: (content, {config}) => content.commit('hydrate', config),
        },
        /*startInterval: ({state, commit, dispatch}) => {console.error("startInterval");
            startInterval(() => {
                {
                    let newVal = state.current + 1;console.error(newVal);
                    if (newVal <= state.activeDuration) {
                        commit('setCurrentValue', {newVal});

                        if(newVal === state.activeDuration){
                        commit('setActive', false);
                        dispatch('stopInterval');
                            }
                        }else {
                            commit('setActive', false);
            dispatch('stopInterval');
                        }
                    }
                });
            },
        stopInterval: () => {
        console.error("stopInterval");
            stopInterval();
        },
        seekToValue: ({state, commit}, {newVal, manual}) => {
            if (state.isActive) {
                stopInterval();
            }
            commit('setCurrentValue', {newVal});
            if (manual) {
                commit('setManualSeek', true);
            }
        },
        manualSeek: ({commit}, payload) => {
            commit('setManualSeek', payload);
        }*/
    },
    mutations: {
        hydrate(state, payload) {
            state.activeDuration = payload.activeDuration;
        },
        setCurrentValue(state, {newVal}) {
            state.current = Number(newVal);
        },
        setActive(state, payload) {
            state.isActive = payload;
        },
        toggleActive(state) {
            state.isActive = !state.isActive;
        },
        setManualSeek(state, payload) {
            state.manualSeekTriggered = payload;
        }
    },
};