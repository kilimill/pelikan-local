import { assign } from 'lodash';

/** @type {import(vuex/types).Module} */

export default {
    namespaced: true,
    state: () => ({
        audioOn: undefined,
        blockPrivateChat: undefined,
        blockPublicChat: undefined,
        blockRaiseHand: undefined,
        hostScreenCapture: undefined,
        micGainValue: undefined,
        videoOn: undefined,
        enableTooltips: undefined
    }),
    getters:{
        micValue(state){
            return state.micGainValue;
        },
        audioOn(state){
            return state.audioOn;
        },
        videoOn(state){
            return state.videoOn;
        },
        enableTooltips(state){
            return state.enableTooltips;
        },
    },
    actions: {
        initModule: {
            root: true,
            handler: ({commit}, {settings}) => {
                commit('hydrate', settings.user || {})
            },
        },
        eventUserSettingChange: {
            root: true,
            handler: ({commit, rootState}, {data}) => {
                if (rootState.application.currentUser.id === data.userId){
                    return commit('changeSetting', data)
                }
            }
        }
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, payload)
        },
        changeSetting(state, {settingName, settingValue}) {
            state[settingName.replace(/^user\./, '')] = settingValue
        },
    }
}