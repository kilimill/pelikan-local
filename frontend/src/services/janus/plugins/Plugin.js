import {Janus} from 'janus-gateway';

export class Plugin {

  handle;
  attachPromise;
  promiseResolve;
  promiseReject;

  player;

  static TYPE_STREAMING = 'janus.plugin.streaming';
  static TYPE_VIDEOROOM = 'janus.plugin.videoroom';
  static TYPE_ECHOTEST = 'janus.plugin.echotest';

  static BITRATE_WEBCAM = 256000;
  static BITRATE_SCREEN_CAPTURE = 512000;

  get currentRoom(){
    return this.janusService.currentRoom;
  }

  get currentUser(){
    return this.janusService.currentUser;
  }

  constructor(janus, type) {
    this.janus = janus;
    this.janusService = this.janus.janusService;
    this.type = type;

    this.attachPromise = new Promise((res, rej) => {
      this.promiseResolve = res;
      this.promiseReject = rej;
    });
    this.attach();
  }

  isStreamingPlugin() {
    return this.type === Plugin.TYPE_STREAMING;
  }

  isVideoRoomPlugin() {
    return this.type === Plugin.TYPE_VIDEOROOM;
  }

  isEchoTestPlugin() {
    return this.type === Plugin.TYPE_ECHOTEST;
  }

  hasPeerConnection(){
    return this.handle.webrtcStuff.pc !== null;
  }

  getMessageEventName(){
    let eventName;
    if(this.isStreamingPlugin()){
      eventName = "streaming";
    }
    if(this.isVideoRoomPlugin()){
      eventName = "videoroom";
    }
    if(this.isEchoTestPlugin()){
      eventName = "echotest";
    }
    return eventName;
  }

  sendMessage(message) {
    this.handle.send({
      "message": message
    });
  }

  attach() {
    this.janus.janus.attach({
      plugin: this.type,
      success: (pluginHandle) => {
        this.attachCallbackSuccess(pluginHandle);
      },
      error: (error) => {
        this.attachCallbackError(error);
      },
      consentDialog: (on) => {
        this.attachCallbackConsentDialog(on);
      },
      mediaState: () => {
        this.attachCallbackMediaState();
      },
      webrtcState: () => {
        this.attachCallbackWebrtcState();
      },
      onmessage: (msg, jsep) => {
        this.attachCallbackOnMessage(msg, jsep);
      },
      // onlocalstream: () => {
      //     this.attachCallbackOnLocalStream();
      // },
      onremotestream: (stream, event) => {
        this.attachCallbackOnRemoteStream(stream, event);
      },
    });
  }

  attachCallbackSuccess(pluginHandle) {
    this.handle = pluginHandle;

    console.log('attachCallbackSuccess' , `${this.constructor.name}`);

    pluginHandle.pluginIsReady = false;
    pluginHandle.eventPauseStreamStopCheck = false;

    this.promiseResolve();
  }

  attachCallbackError(error) {
    Janus.error("  -- Error attaching plugin...", error);
  }

  attachCallbackConsentDialog(on) {
    Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
  }

  attachCallbackMediaState(medium, on) {
    Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
  }

  attachCallbackWebrtcState(on) {
    Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
  }

  attachCallbackOnMessage(msg, jsep) {
    Janus.debug(" ::: Got a message () :::");
    Janus.debug(msg);
    Janus.debug(jsep);
    let event = msg[this.getMessageEventName()];
    Janus.debug("Event: " + event);

    if (jsep !== undefined && jsep !== null) {
      this.messageCallbackJsep(jsep);
    }

    if (msg["error"] !== undefined && msg["error"] !== null) {
      this.messageCallbackError(msg, jsep);
      return;
    }
    if (event === undefined || event === null) {
      return;
    }

    if (event === "attached") {
      this.messageCallbackEventAttached(msg);
    }
    if (event === "joined") {
      this.messageCallbackEventJoined(msg);
    }

    if (event === "destroyed") {
      this.messageCallbackEventDestroyed(msg);
    }

    if(event !== "event"){
      return;
    }

    if (msg['result'] && msg['result']['switched'] === 'ok') {
      this.messageCallbackEventSwitched(msg);
    }

    if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
      this.messageCallbackEventLeaving(msg);
    }

    if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
      this.messageCallbackEventUnpublished(msg);
    }

    if (msg["error"] !== undefined && msg["error"] !== null) {
      this.messageCallbackEventError(msg);
    }
  }

  attachCallbackOnRemoteStream(stream) {
    if (!this.currentRoom.isActive) {
      return;
    }
    Janus.attachMediaStream(
      this.player,
      stream
    );

    if(
      this.janusService.players.main &&
      this.player === this.janusService.players.main &&
      this.janusService.players.video !== undefined &&
      stream.getVideoTracks().length > 0
    ){
      Janus.attachMediaStream(
        this.janusService.players.video,
        stream
      );
    }

    if(this.player !== undefined && this.player.muted){
      this.player.muted = false;
    }
  }

  messageCallbackError(msg) {
    Janus.log(msg);
  }

  messageCallbackEventSwitched() {
    Janus.attachMediaStream(
      this.janusService.players.main,
      this.handle.webrtcStuff.remoteStream
    );
  }

  messageCallbackEventLeaving(msg) {
    Janus.log("Publisher left: " + msg["leaving"]);
  }

  messageCallbackEventUnpublished(msg) {
    Janus.log("Publisher left: " + msg["unpublished"]);
  }

  messageCallbackEventError(msg) {
    Janus.error("WebRTC error:", msg["error"]);
  }

  messageCallbackEventDestroyed() {
    Janus.warn("The room has been destroyed!");
  }


  messageCallbackJsep(jsep) {
    Janus.debug("Handling SDP as well...");
    Janus.debug(jsep);

  }

  messageCallbackEventJoined(msg) {
    Janus.debug(msg);
  }

  setPlayer (player) {
    this.player = player;
  }
}