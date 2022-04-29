export default {
  namespaced: true,
  state: () => ({
    list: [],
    active: {
      host: undefined,
      called: undefined,
      screen: undefined,
    }
  }),
  getters: {
      activeFileHost(state){
        return state.active.host;
      },
      activeFileCalled(state){
        return state.active.called;
      },
      activeFileScreen(state){
        return state.active.screen;
      },
      files(state){
        return state.list;
      },
      available: state => state.list.filter(i => i.active && !i.deleted)
  },
  actions: {
    initModule: {
      root: true,
      handler: (content, {files}) => content.commit("hydrate", files)
    },
    eventRoomMediaFileToggle: {
      root: true,
      handler: (context, {data: {id, activity: active}}) => {
        const item = context.state.list.find(i => i.id === id)
        context.commit("update", {...item, active})
      }
    },
    eventRoomMediaFileDelete: {
      root: true,
      handler: (context, {data: {id}}) => context.commit("delete", id)
    },
    setActiveFile(context, {type, fileId}){
      context.commit('setActive', {type, fileId})
    },
    unsetActiveFile(context, {type}){
      context.commit('unsetActive', {type})
    },

  },
  mutations: {
    hydrate (state, payload) {
      state.list = payload || [];
    },
    setActive(state, {type, fileId}){
      state.active[type] = state.list.find(f => f.id === fileId);
    },
    unsetActive(state, {type}){
      state.active[type] = undefined;
    },
    update: (state, item) => state.list = [...state.list.filter(i => i.id !== item.id), item],
    delete: (state, id) => state.list = state.list.filter(i => i.id !== id)
  },
}