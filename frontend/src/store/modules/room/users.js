import userApi from "@/api/user"
import RoomUsersReducer from "@/api/application/reducers/RoomUsersReducer"
import SimpleObjectHydration from "@/abstract/SimpleObjectHydration"
import {ROLE_ID_HOST} from "@/store/modules/user/roles"
import {CALL_STATUS_ACTIVE, CALL_STATUS_NOT_CALLED, CALL_STATUS_WAITING} from "@/store/modules/user/callStatuses"
import { isEmpty, omitBy, isObject, assign } from 'lodash';

const usersList = (state) => [
    ...[state.host, state.current, state.called].filter(i => i),
    ...state.assistants,
    ...state.participants,
]

export default {
    namespaced: true,
    state: () => ({
        host: undefined,
        current: undefined,
        called: undefined,
        assistants: [],
        participants: [],
        highlight: [],
    }),

    actions: {
        initModule: {
            root: true,
            handler: ({commit}, {users}) => {
                commit('hydrate', users || {})
            },
        },
        changeSetting(context, {userId, settingName, settingValue}) {
            return userApi.changeUserSetting(userId, settingName, settingValue)
        },

        call({state, rootState}, userId) {
            return userApi.call(userId).then(response => state.called && state.called.handRaised
                ? userApi.toggleRaiseHand(userId, rootState.room.id)
                : Promise.resolve(response))
        },

        dropCall(context, userId) {
            return userApi.dropCall(userId)
        },

        eventRoomToggleRaiseHand: {
            root: true,
            handler: ({commit}, {data}) => commit('userHandRaised', data)
        },
        eventRoomLowerAllHands: {
            root: true,
            handler: ({commit}) => commit("lowerAllHands")
        },
        eventUserSettingChange: {
            root: true,
            handler: ({commit}, {data}) => commit('userSettings', data)
        },
        eventRoomMessagePrivate: {
            root: true,
            handler({commit, getters}, {data}) {
                if (getters.isCurrent(data['targetUserId'])) {
                    commit('highlight', {userId: data['userId'], highlight: true})
                }
            }
        },

        eventRoomLeave: {
            root: true,
            handler: ({commit}, {data}) => commit('leaveUser', data.user)
        },

        eventRoomJoin: {
            root: true,
            handler: ({commit}, {data}) => commit('joinUser', data.user)
        },

        eventUserEchoTestResults: {
            root: true,
            handler: ({commit}, {data}) => commit('changeUser', data)
        },

        eventRoomCallUser: {
            root: true,
            handler: ({commit, rootState}, {data}) => commit('callUser', {
                userId: data.userId,
                isCurrent: rootState.user.id === data.userId,
            }),
        },

        eventRoomDropUserCall: {
            root: true,
            handler: ({commit, rootState}, {data}) => commit('dropCall', rootState.user.id === data.userId),
        },

        eventUserParticipantStream: {
            root: true,
            handler: ({commit}, {data}) => commit("changeUser", {
                userId: data.userId,
                callStatusId: CALL_STATUS_ACTIVE,
            }),
        },
        eventRoomLeaveByDaemon: {
            root: true,
            handler: (context, {data: {users}}) => (users?.participants || []).forEach(i => {
                const participant = context.getters["findUser"](i)
                participant ? context.commit("leaveUser", participant) : undefined
            })
        }
    },

    getters: {
        /**
         * Full list of users in room
         * @param state
         * @return {*[]}
         */
        list: state => usersList(state),
        handRaised: (state, getters) => getters["list"].filter(i => Boolean(i.handRaised)),
        isHost: state => userId => state.host && state.host.id === userId,
        isCurrent: state => userId => (state.current || state.host)?.id === userId,
        isCalled: state => userId => state.called && state.called.id === userId,
        isResolvingCall: state => userId => state.called && state.called.id === userId &&
          state.called.callStatusId === CALL_STATUS_WAITING,
        isHighlighted: state => userId => state.highlight.includes(userId),
        findUser: (state, getters) => userId => getters.list.find(i => i.id === userId),
        calledUser: state => state.called,
        host: state => state.host
    },
    mutations: {
        hydrate(state, payload) {
            assign(state, payload)
        },
        userHandRaised(state, {handRaised, userId}) {
            usersList(state).find(i => i.id === userId).handRaised = handRaised ? Date.now() : 0
        },
        userSettings(state, {userId, settingName, settingValue}) {
            const userSettings = usersList(state).find(i => i.id === userId).settings

            if (userSettings !== undefined) {
                settingName = settingName.replace(/^user\./, '')
                userSettings[settingName] = settingValue
            }
        },
        lowerAllHands(state) {
            usersList(state).forEach(i => i.handRaised = 0)
        },
        highlight(state, {userId, highlight = false}) {
            let index = state.highlight.findIndex(i => i === userId)

            if (index < 0 && highlight === true) {
                state.highlight.push(userId)
            } else if (~index && highlight === false) {
                state.highlight.splice(index, 1)
            }
        },
        changeUser(state, payload) {
            let user = usersList(state).find(i => i.id === payload.userId)
            payload = omitBy(RoomUsersReducer.reduceUser(payload), v => isObject(v) && isEmpty(v))
            SimpleObjectHydration.hydrate(user, payload)
        },
        leaveUser(state, user) {
            user = RoomUsersReducer.reduceUser(user)
            if (user.roleId === ROLE_ID_HOST) {
                state.host = undefined
            } else if (state.called && state.called.id === user.id) {
                state.called = undefined
            } else {
                state.participants = state.participants.filter(i => i.id !== user.id)
            }
        },

        joinUser(state, user) {
            user = RoomUsersReducer.reduceUser(user)

            if (user.roleId === ROLE_ID_HOST) {
                state.host = user
            } else state.participants.push(user)
        },

        callUser(state, {userId, isCurrent}) {
            state.called = usersList(state).find(i => i.id === userId)
            state.called.callStatusId = CALL_STATUS_WAITING

            if (!isCurrent) {
                state.participants = state.participants.filter(i => i.id !== userId)
            } else state.current = undefined

        },

        dropCall(state, isCurrent) {
            if (state.called) {
                state.called.callStatusId = CALL_STATUS_NOT_CALLED
                isCurrent
                    ? state.current = state.called
                    : state.participants.push(state.called)
                state.called = undefined
            }
        }
    }
}