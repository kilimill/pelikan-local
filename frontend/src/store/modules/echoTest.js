export default {
  namespaced: true,

  state: () => ({
    player: undefined,
    mic: undefined,
    accepted: undefined,
    status:{
      started: false,
      failed: false,
      finished: false,
    },
    results: {
      hasAudio: false,
      hasVideo: false
    },
    test: {
      messages: false
    },
    modal: {
      msg: "",
      show: false
    },
    alert: {
      msg: "",
      show: false,
      type: ""
    }
  }),
  mutations: {
    setModalMsg(state, payload){
      state.modal.msg = payload;
    },
    setModalShow(state, payload){
      state.modal.show = payload;
    },
    setAlertMsg(state, payload){
      state.alert.msg = payload;
    },
    setAlertShow(state, payload){
      state.alert.show = payload;
    },
    setAlertType(state, payload){
      state.alert.type = payload;
    },
    setPlayer (state, payload) {
      state.player = payload;
    },
    setFinished (state, payload) {
      state.status.finished = payload;
    },
    setStarted(state, payload){
      state.status.started = payload;
    },
    setFailed(state, payload){
      state.status.failed = payload;
    },
    setMessagesTest(state, payload){
      state.test.messages = payload;
    },
    setEchoTestResults(state, {hasAudio, hasVideo, finished}){
      state.results.hasAudio = Boolean(hasAudio);
      state.results.hasVideo = Boolean(hasVideo);
      state.status.finished = Boolean(finished);
    },
    userAccepted: (state, accepted) => {
      state.accepted = Boolean(accepted)
    }
  },
  getters: {
    player (state) {
      return state.player;
    },
    started(state){
      return state.status.started;
    },
    finished (state) {
      return state.status.finished;
    },
    failed(state){
      return state.status.failed;
    },
    messagesTest(state){
      return state.test.messages;
    },
    modalMsg(state){
      return state.modal.msg;
    },
    modalShow(state){
      return state.modal.show;
    },
    alertMsg(state){
      return state.alert.msg;
    },
    alertShow(state){
      return state.alert.show;
    },
    alertType(state){
      return state.alert.type;
    },
    resultsAudio(state){
      return state.results.hasAudio;
    },
    resultsVideo(state){
      return state.results.hasVideo;
    }
  },
};
