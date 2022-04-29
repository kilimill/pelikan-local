import roomApi from "@/api/room";
import { assign } from 'lodash';


/** @type {import(vuex/types).Module} */
export default {
    namespaced: true,
    state: () => ({
        activeBoardId: undefined,
        activeMountPointId: undefined,
        blockPrivateChat: undefined,
        blockPublicChat: undefined,
        blockRaiseHand: undefined,
        boardIsActive: undefined,
        currentPresId: undefined,
        currentSlide: undefined,
        currentVPDF:undefined,
        drawMode: undefined,
        presStrictMode: undefined,
        screenCaptureActive: undefined,
        soundPrivateChatMessage: undefined,
        soundPublicChatMessage: undefined,
        soundRaiseHand: undefined,
        userCallControl: undefined,
        userCallDrawMode: undefined,
        videoStrictMode: undefined,
        typeIpAudioOn: undefined
    }),
    getters:{
        settings: state => name => {
            return state[name];
        },
        currentPresentationId(state){
            return state.currentPresId;
        },
        currentPresentationSlideIndex(state){
            return state.currentSlide;
        },
        presentationStrictMode(state){
            return state.presStrictMode;
        },
        activeMountPointId(state){
            return state.activeMountPointId;
        },
        screenCaptureActive(state){
            return state.screenCaptureActive;
        },
        typeIpAudioOn(state){
            return state.typeIpAudioOn;
        }
    },
    actions:{
        initModule: {
            root: true,
            handler: ({commit}, {settings}) => {
                commit('hydrate', settings.room || {})
            },
        },
        changeSetting(context, {settingName, settingValue}) {
            return roomApi.changeSetting(settingName, settingValue, context.rootState.room.id)
        },
        eventRoomSettingChange: {
            root: true,
            handler({commit}, {data}){
                commit('changeSetting', data)
            }
        },

        eventRoomDropUserCall: {
            root: true,
            handler({commit}, {data}){
                commit('changeSetting', {
                    settingName: 'room.activeMountPointId',
                    settingValue: data.activeMountPointId,
                })
            }
        },

        eventStreamWatch: {
            root: true,
            handler({commit}, {data}){
                commit('changeSetting', {
                    settingName: 'room.activeMountPointId',
                    settingValue: data.activeMountPointId,
                })
            }
        },
        eventRoomScreenCaptureToggle: {
            root: true,
            handler({commit}, {data}){
                commit('changeSetting', {
                    settingName: 'room.screenCaptureActive',
                    settingValue: data.active,
                })
            }
        },
        eventRoomBoardSelect: {
            root: true,
            handler: context => context.commit("changeSetting", {
                settingName: "room.boardIsActive",
                settingValue: true,
            })
        },
        eventRoomPresentationSelect: {
            root: true,
            handler: context => context.commit("changeSetting", {
                settingName: "room.boardIsActive",
                settingValue: false,
            })
        },

        setBlockPublicChat(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeBlockPublicChat(payload)
        },

        setBlockRaiseHand(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeBlockRaiseHand(payload)
        },

        setVideoStrictMode(context, payload) {
            return roomApi.setRoom(context.rootState.room.id).changeVideoStrictMode(payload)
        }
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, payload)
        },
        changeSetting(state, {settingName, settingValue}) {
            state[settingName.replace(/^[^.]+\./, '')] = settingValue
        }
    }
}