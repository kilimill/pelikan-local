import api from "@/api"

export default {
  downloadChatPublic(){
    return api({
      method: 'GET',
      url: `/download/chat-public`,
      responseType: 'blob'
    });
  },
  downloadChatPrivate(){
    return api({
      method: 'GET',
      url: `/download/chat-private`,
      responseType: 'blob'
    });
  },
  downloadListUsers(){
    return api({
      method: 'GET',
      url: `/download/list-users`,
      responseType: 'blob'
    });
  },
}