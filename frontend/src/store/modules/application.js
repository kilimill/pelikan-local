import applicationApi from '@/api/application'
export const APP_MODE_ACTIVITY = 'mode.activity'
export const APP_MODE_PLAYBACK = 'mode.playback'

export default {
    namespaced: true,

    state: () => ({
        ready: false,
        error: undefined,
        online: undefined,
        mode: undefined,
        config: {
            activityRequestInterval: undefined,
            activityRequestAttempts: undefined,
            backLink: undefined,
            hostInfo: undefined,
            storageInfo: undefined,
            defaultSlideUrl: undefined,
            noVideoSource: undefined,
            timestamp: undefined,
            ICEServerIP: {}
        },
        userCallControl: {
            inProgress: undefined,
            timePassed: undefined,
            timeout: undefined,
        },
        roomChannel: {
            publicName: undefined,
            privateName: undefined,
        },
        userChannel: {
            code: undefined,
            userId: undefined,
        },
        testing: {
            channelCode: undefined,
            roleId: undefined,
            channelId: undefined,
        },
        currentRoom: {},
        currentUser: {},
        streams: {},
        materials: {},
        playbackData: {},
        nchanServers: [],
        mountPoints: {ip: [], web: undefined},
        constants: {},
        echoTest: {
            results: {
                hasAudio: false,
                hasVideo: false
            }
        }
    }),
    mutations: {
        loading: (state, payload) => {state.ready = !payload},
        error: (state, payload) => {state.error = payload},
        online: (state, payload) => {state.online = payload},
        mode: (state, mode) => state.mode = mode,
        configure: (state, payload) => {
            for (let [key, value] of Object.entries(payload)) {
                if (state[key] !== undefined  && typeof state[key] === typeof value) {
                    state[key] = value;
                }
            }
        },
        setUserCallControlInProgress(state, payload){
            state.userCallControl.inProgress = payload;
        },
    },
    actions: {
        init({commit}) {
            return applicationApi.initRoom().then(configuration => {
                commit("configure", configuration)
                return configuration
            }).catch(reason => {
                commit('error', reason)
            })
        },
        eventUserParticipantStream: {
            root: true,
            handler: ({commit,rootState}) => {
                if(rootState.room.settings.userCallControl){
                    commit('setUserCallControlInProgress', true);
                }
            },
        },
        eventRoomUserCallControlPassed: {
            root: true,
            handler: ({commit}) => {
                return commit('setUserCallControlInProgress', false);
            },
        },
        eventRoomDropUserCall: {
            root: true,
            handler: ({commit}) => {
                return commit('setUserCallControlInProgress', false);
            },
        }
    },
    getters: {
        /**
         *
         * @param state
         * @returns {*}
         */
        isOnline(state){
            return state.online;
        },
        /**
         * Returns channels array
         * @param state
         * @return {string|undefined}
         */
        getChannels(state) {
            if (state.roomChannel.publicName && state.roomChannel.privateName) {
                return [state.roomChannel.privateName, state.roomChannel.publicName]
            }
        },
        
        getRoute(){
            return '/centrifugo/sub'
        },
        
        /**
         * Returns channels array
         * @param state
         * @return {string|undefined}
         */
        getChannelCode(state){
            return state.currentUser.channelCode
        },

        /**
         * @param state
         * @return {string[]}
         */
        nchanServersList: state => state.nchanServers.map(i  => i.domain),

        /**
         *
         * @param state
         * @returns {{}}
         */
        constants(state){
            return state.constants;
        },
        /**
         *
         * @param state
         * @returns {*}
         */
        channelPublic(state){
            return state.roomChannel.publicName;
        },
        /**
         *
         * @param state
         * @returns {*}
         */
        channelPrivate(state){
            return state.roomChannel.privateName;
        },
        /**
         *
         * @param state
         * @returns {*}
         */
        hostInfo(state){
            return state.config.hostInfo;
        },
        /**
         *
         * @param state
         * @returns {*}
         */
        backLink(state){
            return state.config.backLink;
        },

        /**
         * @return {string|null}
         */
        logoutLink(state) {
            return state.config.hostInfo && state.config.backLink
                ? `${state.config.hostInfo}/room/leave?backLink=${state.config.backLink}`
                : null
        },
        /**
         *
         * @param state
         * @returns {{web: *, ip: []}}
         */
        mountPoints(state){
            return state.mountPoints;
        },

        /**
         *
         * @param state
         * @returns {*}
         */
        userCallControlInProgress(state){
            return state.userCallControl.inProgress;
        },

        /**
         *
         * @param state
         * @returns {*}
         */
        userCallControlTimeout(state){
            return state.userCallControl.timeout;
        }
    }
}