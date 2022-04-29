export default {
  namespaced: true,

  state: () => ({
    players: {
      main: undefined,
      secondary: undefined,
      screen: undefined
    },
    media: {
      ready: false,
      deviceReady: false,
      started: false,
      stream: {
        echo: undefined,
        device: undefined,
        local: undefined,
        screen: undefined,
      },
      devices: {
        audio:{
          selected: undefined,
          list: []
        },
        video:{
          selected: undefined,
          list: []
        },
      }
    },
    permissions: {
      audio: false,
      video: false
    },
    mainSelectValue: undefined
  }),
  mutations: {
    setPlayer (state, payload) {
      state.players[payload.name] = payload.value;
    },
    setMediaReady (state, payload) {
      state.media.ready = payload;
    },
    setMediaDeviceReady (state, payload) {
      state.media.deviceReady = payload;
    },
    setMediaStarted (state, payload) {
      state.media.started = payload;
    },
    setMediaStreamEcho (state, payload) {
      state.media.stream.echo = payload;
    },
    setMediaStreamDevice (state, payload) {
      state.media.stream.device = payload;
    },
    setMediaStreamLocal (state, payload) {
      state.media.stream.local = payload;
    },
    setMediaStreamScreen (state, payload) {
      state.media.stream.screen = payload;
    },
    setMainSelectValue (state, payload) {
      state.mainSelectValue = payload;
    },
    setMediaDevices (state, payload){
      state.media.devices = payload;
    },
    setAudioSelected(state, payload){
      state.media.devices.audio.selected = payload;
    },
    setVideoSelected(state, payload){
      state.media.devices.video.selected = payload;
    },
    setAudioDevicesList(state, payload){
      state.media.devices.audio.list = payload;
    },
    setVideoDevicesList(state, payload){
      state.media.devices.video.list = payload;
    },
    setPermission(state, {type, value}){
      state.permissions[type] = value
    }
  },
  getters: {
    mediaAudioSelected(state){
      return state.media.devices.audio.selected;
    },
    mediaVideoSelected(state){
      return state.media.devices.video.selected;
    },
    playerMain (state) {
      return state.players.main;
    },
    playerSecondary (state) {
      return state.players.secondary;
    },
    playerScreen (state) {
      return state.players.screen;
    },
    mediaReady (state) {
      return state.media.ready;
    },
    mediaDeviceReady (state) {
      return state.media.deviceReady;
    },
    mediaStarted (state) {
      return state.media.started;
    },
    mediaStreamEcho(state){
      return state.media.stream.echo;
    },
    mediaStreamDevice(state){
      return state.media.stream.device;
    },
    mediaStreamLocal(state){
      return state.media.stream.local;
    },
    mediaStreamScreen(state){
      return state.media.stream.screen;
    },
    mainSelectValue (state) {
      return state.mainSelectValue;
    },
    mediaDevices(state){
      return state.media.devices;
    },
    mediaDevicesAudioSelected(state){
      return state.media.devices.audio.selected;
    },
    mediaDevicesVideoSelected(state){
      return state.media.devices.video.selected;
    },
    mediaDevicesAudioList(state){
      return state.media.devices.audio.list;
    },
    mediaDevicesVideoList(state){
      return state.media.devices.video.list;
    },
    permissionAudio(state){
      return state.permissions.audio;
    },
    permissionVideo(state){
      return state.permissions.video;
    },
    listAudio(state){
      return state.media.devices.audio.list.map(i => {return {name: i.label, value: i.id}})
    },
    listVideo(state){
      return state.media.devices.video.list.map(i => {return {name: i.label, value: i.id}})
    }
  },
};
