/**
 *
 * @param {Number|undefined} userID
 */
 import {useStore} from "vuex";
 import useChatPrivateMessages from "@/composables/chat/useChatPrivateMessages";
 import useChatPublicMessages from "@/composables/chat/useChatPublicMessages";
 import {computed} from "vue";
 
 export default function useChatMessages(userID = undefined) {
     const store = useStore()
 
     store.commit('tabs/chat/private/dialog', userID || store.state.tabs.chat.private.current)
 
     const {
         dialog,
         dialogName,
         privateMessages,
         privateChatBlocked,
         sendPrivateMessage,
         privateMarkAsRead,
         clearDialogs
     } = useChatPrivateMessages()
 
     const {
         availableOrders,
         publicSortOrder,
         publicChatBlocking,
         publicChatBlocked,
         publicMessages,
         sendPublicMessage,
         publicMarkAsRead,
         clearPublicMessages
     } = useChatPublicMessages()
 
     return {
         availableOrders,
         publicSortOrder,
         publicChatBlocking,
         clearPublicMessages,
         dialog,
         dialogName,
         clearDialogs,
 
         clearChatMessages: () => {
             clearDialogs()
             clearPublicMessages()
         },
         
 
         blocked: computed(() => dialog.value ? privateChatBlocked.value : publicChatBlocked.value),
         messages: computed(() => dialog.value ? privateMessages.value : publicMessages.value),
         sendMessage: (message) => dialog.value ? sendPrivateMessage(message) : sendPublicMessage(message),
         markAsRead: () => dialog.value ? privateMarkAsRead(dialog.value) : publicMarkAsRead()
     }
 }