import {computed, readonly} from "vue";
import {useStore} from "vuex";
import {SORT_TIME, SORT_USER} from "@/store/modules/tabs/chat/public";

export default function useChatPublicMessages() {
    const store = useStore()
    const sortOrder = computed({
        get: () => store.state.tabs.chat.public.sortOrder,
        set: vl => store.commit('tabs/chat/public/sortOrder', vl)
    })

    const unsortedMessages = computed(() => store.state.tabs.chat.public.messages)

    return {
        availableOrders: readonly({SORT_TIME, SORT_USER}),
        publicSortOrder: sortOrder,
        publicChatBlocking: computed({
            get: () => store.state.room.settings.blockPublicChat,
            set: vl => store.dispatch('room/settings/setBlockPublicChat', vl)
        }),
        publicChatBlocked: computed(() => store.getters["tabs/chat/public/isBlocked"]),
        publicMessages: computed(() => ({
            [SORT_TIME]: unsortedMessages.value.map(i => i).sort((a, b) => a.id - b.id),
            [SORT_USER]: unsortedMessages.value.map(i => i).sort((a, b) => a.userId - b.userId),
        }[sortOrder.value])),
        sendPublicMessage: (message) => store.dispatch('tabs/chat/public/sendMessage', message),
        clearPublicMessages: () => store.commit('tabs/chat/public/clearPublicMessages'),
        publicMarkAsRead: () => store.commit('tabs/highlightComponent', {name: 'TabChat', highlight: false}),
    }
}