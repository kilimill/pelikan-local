export const STATUS_PENDING = 1;
export const STATUS_ACTIVE = 2;
export const STATUS_PAUSED = 3;
export const STATUS_DISABLED = 4;

export default {
  namespaced: true,
  state: () => ({
    list: [],
  }),
  getters:{
    activeStreams(state){
      return state.list.filter(
        val => (val.statusId !== STATUS_DISABLED) && (val.videoOn === 1)
      );
    },
    allStreams(state){
      return state.list;
    },
  },
  actions:{
    initModule: {
      root: true,
      handler: (content, {streams}) => content.commit("hydrate", streams)
    },
    eventStreamToggleVideo: {
      root: true,
      handler: ({commit}, {data}) => commit("toggleStream", {
        streamId: data.streamId,
        videoOn: data.videoOn,
      })
    },
    eventRoomMassToggleVideo: {
      root: true,
      handler: ({commit, state}, {data}) => {
        state.list.forEach((item) => {
          if (item.videoOn !== data.value){
            commit('toggleStream', {
              streamId: item.id,
              videoOn: data.value
            });
          }
        });
      }
    },
  },
  mutations:{
    hydrate(state, payload) {
      state.list = Object.values(payload || {});
    },
    toggleStream(state, {streamId, videoOn}){
      state.list.find(i => i.id === streamId).videoOn = videoOn;
    },
  },
}