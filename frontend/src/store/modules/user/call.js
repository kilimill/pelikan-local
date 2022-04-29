export default {
  namespaced: true,
  state: () => ({
    showCallDialog: false
  }),
  getters: {
    callDialog(state){
      return state.showCallDialog
    }
  },
  mutations: {
    setCallDialogStatus(state, payload) {
      state.showCallDialog = payload
    },
  }
}