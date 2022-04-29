import userApi from "@/api/user";
import settings from "@/store/modules/user/settings";
import activity from "@/store/modules/user/activity";
import { assign, omit } from 'lodash';

import {
    AVAILABLE_ROLES,
    ROLE_ID_HOST,
    ROLE_ID_USER,
} from '@/store/modules/user/roles';

import {
    CALL_STATUS_ACTIVE,
    CALL_STATUS_NOT_CALLED,
    CALL_STATUS_WAITING,
} from '@/store/modules/user/callStatuses';
import call from '@/store/modules/user/call';

/** @type {import('vuex/types').Module} */
export default {
    namespaced: true,
    modules: {
        settings, call
    },
    state: () => ({
        alias: undefined,
        authKey: undefined,
        callStatusId: undefined,
        channelCode: undefined,
        externalUserId: undefined,
        handRaised: undefined,
        hasAudio: undefined,
        hasVideo: undefined,
        id: undefined,
        lastActivity: undefined,
        messagesPrivate: undefined,
        roleId: undefined,
        roomId: undefined,
        sessionId: undefined,
        statusId: undefined

    }),
    getters: {
        isHost(state) {
            return state.roleId === ROLE_ID_HOST
        },
        canRaiseHand(state, getters, rootState) {
            return getters.currentUser.isNotCalled && !(rootState.room.settings.blockRaiseHand || state.settings.blockRaiseHand)
        },
        callStatusId(state) {
            return state.callStatusId;
        },
        getChannelCode(state) {
            return state.channelCode;
        },
        currentUser: state => ({
            isHost: state.roleId === ROLE_ID_HOST,
            isParticipant: state.roleId === ROLE_ID_USER,
            isCalled: state.callStatusId === CALL_STATUS_ACTIVE,
            isCallWaiting: state.callStatusId === CALL_STATUS_WAITING,
            isNotCalled: state.callStatusId === CALL_STATUS_NOT_CALLED,
            name: state.alias,
            role: AVAILABLE_ROLES[state.roleId],
            id: state.id,
            settings: state.settings,
            callStatusId: state.callStatusId,
            roleId: state.roleId
        }),

    },
    actions: {
        raiseHand({state, rootState}) {
            userApi.toggleRaiseHand(state.id, rootState.room.id).catch(reason => console.error(reason))
        },

        initModule: {
            root: true,
            handler: (context, {currentUser}) => {
                context.commit('hydrate', currentUser)

                activity(
                    context.rootState.application.config.activityRequestInterval,
                    context.rootState.application.config.activityRequestAttempts,
                    userApi.updateActivity
                )
            }
        },

        eventRoomToggleRaiseHand: {
            root: true,
            handler(context, {data}) {
                if (data.userId === context.state.id) {
                    context.commit('handRaised', data.handRaised)
                }
            }
        },
        eventRoomLowerAllHands: {
            root: true,
            handler: ({commit}) => commit("handRaised", false)
        },

        eventRoomCallUser: {
            root: true,
            handler: ({commit, state}, {data}) => {
                if (state.id === data.userId) {
                    return commit('setCalledWaitingStatusId')
                }
            },
        },

        eventUserParticipantStream: {
            root: true,
            handler: ({commit, state}, {data}) => {
                if (state.id === data.userId) {
                    return commit('setCalledStatusId')
                }
            },
        },

        eventRoomDropUserCall: {
            root: true,
            handler: ({commit}) => commit('dropCalledStatusId'),
        },
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, omit(payload, ['settings']))
            assign(state.settings, payload.settings)
        },
        handRaised(state, payload) {
            state.handRaised = payload
        },

        setCalledWaitingStatusId(state) {
            return state.callStatusId = CALL_STATUS_WAITING
        },

        setCalledStatusId(state) {
            return state.callStatusId = CALL_STATUS_ACTIVE
        },

        dropCalledStatusId(state) {
            return state.callStatusId = CALL_STATUS_NOT_CALLED
        }

    }
}