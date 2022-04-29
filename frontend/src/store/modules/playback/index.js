import timeline from '@/store/modules/playback/timeline';
import files from '@/store/modules/playback/files';
import ranges from '@/store/modules/playback/ranges';
import mountpoints from '@/store/modules/playback/mountpoints';
import messages from '@/store/modules/playback/messages';
import video from "@/store/modules/playback/video";

export default {
  namespaced: true,
  modules: { timeline, files, ranges, mountpoints, messages, video },
  state: () => ({
    ready: false,
    error: undefined,
    config: {
      ICEServerIP: undefined,
      activeDuration: undefined,
      activityRequestAttempts: undefined,
      activityRequestInterval: undefined,
      backLink: undefined,
      defaultSlideUrl: undefined,
      hostInfo: undefined,
      storageInfo: undefined,
      timestamp: undefined,
    },
    playing: false,
    waiting: {
      video: false,
      events: false,
      screen: false,
    }
  }),
  getters: {
    storageInfo(state){
      return state.config.storageInfo;
    },
    loading(state){
      return !state.ready
    },
    duration(state) {
      return state.config.activeDuration * 1000;
    },

    waiting: state => {
      return Object.values(state.waiting).reduce((a, i) => a || i, false)
    }
  },
  actions: {
    initModule: {
      root: true,
      handler: (content, {config}) => {
        content.commit("hydrate", config)
      }
    },
  },
  mutations: {
    loading: (state, payload) => {state.ready = !payload},
    error: (state, payload) => {state.error = payload},
    hydrate: (state, payload) => state.config = {...state.config, ...payload},
    waiting: (state, waiting) => state.waiting = {...state.waiting, ...waiting},
    playing: (state, playing) => state.playing = Boolean(playing)
  },
};