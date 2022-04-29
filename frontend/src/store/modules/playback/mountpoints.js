export const TYPE_IP_CAM = 1
export const TYPE_WEB_CAM_HOST = 2
export const TYPE_WEB_CAM_CALLED_USER = 3
export const TYPE_HOST_SCREEN = 4

const mountPointMap = {
  [TYPE_IP_CAM]: "host",
  [TYPE_WEB_CAM_HOST]: "host",
  [TYPE_WEB_CAM_CALLED_USER]: "called",
  [TYPE_HOST_SCREEN]: "screen",
};

export default {
  namespaced: true,
  state: () => ({
    list: [],
    //active: undefined
  }),
  getters: {
    active(state, getters, rootState) {
      return state.list.find(i => i.id === rootState.room.settings.activeMountPointId);
    },
    activeId(state, getters) {
      return getters.active?.id;
    },
    typeActive(state, getters) {
      return getters.active ? mountPointMap[getters.active.typeId] : undefined
    },
    typeById: state => (id) => {
      return mountPointMap[state.list.find(m => m.id === id).typeId]
    },
    list: state => state.list.map(point => ({...point, type: mountPointMap[point.type_id]})),
  },
  actions: {
    initModule: {
      root: true,
      handler: (context, {mountPoints}) => {
        context.commit("hydrate", mountPoints)
      }
    },
    setActiveMountPoint(context, {id}){
      let mp = context.state.list.find(m => m.id === id)
      return context.commit("setActive", mp);
    }
  },
  mutations: {
    hydrate (state, payload) {
      state.list = payload;
    },
    setActive(state, payload){
      state.active = payload;
    }
  },
}