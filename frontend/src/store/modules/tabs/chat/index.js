import publicChat from '@/store/modules/tabs/chat/public'
import privateChat from '@/store/modules/tabs/chat/private'

/** @type {import('vuex/types').Module} */
export default {
    namespaced: true,
    modules: {public: publicChat, private: privateChat},

    actions: {
        initModule: {
            root: true,
            handler: ({commit}, {messages}) => {
                commit('public/hydrate', messages.public || {})
                commit('private/hydrate', messages.private || {})
            },
        },

        sendMessage({state, dispatch}, payload) {
            return dispatch(`${state.mode}/sendMessage`, payload)
        }
    },
}