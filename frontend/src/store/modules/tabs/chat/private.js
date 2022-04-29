import chat from "@/api/chat";

/** @type {import('vuex/types').Module} */
const module = {
    namespaced: true,

    state: () => ({
        // Диалог с пользователем
        current: undefined, // Активный диалог (ID пользователя с которым беседа)
        dialogs: {} // В формате { USER_ID : [/*messages*/] }
    }),
    getters: {
        dialogMessages: (state) => {
            return state.current ? state.dialogs[state.current] : []
        },
        isBlocked: (state, getters, rootState) => {
            return rootState.room.settings.blockPrivateChat || rootState.user.settings.blockPrivateChat
        }
    },
    actions: {
        sendMessage(context, message) {
            let from = context.rootState.user.id,
                to = context.state.current
            return chat.sendPrivateMessage({from, to, message})
        },

        eventRoomMessagePrivate: {
            root: true,
            handler({commit, rootState}, {data}) {
                let dialog = data.userId === rootState.application.currentUser.id ?
                    data.targetUserId : data.userId
                commit('pushMessage', {dialog, message: data})
            }
        },
    },
    mutations: {
        pushMessage(state, {dialog, message}) {
            if (state.dialogs[dialog] === undefined) {
                state.dialogs[dialog] = []
            }

            state.dialogs[dialog].push(message)
        },

        hydrate(state, payload) {
            for (let [dialog, messages] of Object.entries(payload || {})) {
                state.dialogs[dialog] = Object.values(messages)
            }
        },

        clearDialogs(state) {
            console.log('wefwefwef')
            state.dialogs = {}
        },

        /**
         * Choice dialog
         * @param state
         * @param {Number|undefined} dialog
         */
        dialog(state, dialog) {
            if (dialog && typeof state.dialogs[dialog] === "undefined") {
                state.dialogs[dialog] = []
            }

            state.current = dialog
        }
    }
}

export default module