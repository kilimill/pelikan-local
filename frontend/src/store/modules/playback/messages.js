export default {
  namespaced: true,

  state: () => ({
    list: [],
  }),
  getters:{
    lastSelectedMountPointId: state => (timeVal) => {
      let message = state.list.filter(m => m.timeValue <= timeVal).pop();
      return message.mountPointId;
    }
  },
  actions: {
    initModule: {
      root: true,
      handler: (context, {switchEvents}) => {
        context.commit("hydrate", switchEvents)
      }
    },
  },
  mutations: {
    hydrate (state, payload) {
      state.list = payload;
    },
  },

}