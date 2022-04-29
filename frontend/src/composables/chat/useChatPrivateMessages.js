import {useStore} from "vuex";
import {computed} from "vue";
import useUsersRepository from "@/composables/users/useUsersRepository";

export default function useChatPrivateMessages() {
    const store = useStore()

    const {findUser} = useUsersRepository()

    const dialog = computed({
        get: () => store.state.tabs.chat.private.current,
        set: vl => store.commit('tabs/chat/private/dialog', vl)
    })

    return {
        dialog,
        dialogName: computed(() => (findUser(dialog.value) || {alas: undefined}).alias),
        privateChatBlocked: computed(() => store.getters["tabs/chat/private/isBlocked"]),
        privateMessages: computed(() => store.getters["tabs/chat/private/dialogMessages"]),
        sendPrivateMessage: (message) => store.dispatch('tabs/chat/private/sendMessage', message),
        clearDialogs: () => store.commit('tabs/chat/private/clearDialogs'),
        privateMarkAsRead: (userId) => store.commit('room/users/highlight', {userId})
    }
}