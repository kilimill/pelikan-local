<template>
  <canvas id="micCanvas" class="tab-setting-mic-canvas" ref="mic" width="160" height="5"></canvas>
  <input class="tab-setting-mic-value" type="range" min="0" max="100" step="1" v-model.lazy="userSettings.micGainValue">
</template>

<script>
import useUserSettings from "@/composables/users/useUserSettings";
import {useStore, mapMutations, mapGetters} from 'vuex'
import {computed, reactive} from "vue";
import useMessageSubscription from "@/composables/useMessageSubscription";
import useMicController from "@/composables/tabs/useMicController";

export default {
  name: 'MicControl',
  setup() {
    const store = useStore()
    const events = computed(() => store.state.application.constants.events)
    const {on, off} = useMessageSubscription(store.getters["application/getChannels"])

    const {
      changeMicLevel,
      setMicGainNode,
      micLevelDraw,
      micLevelAnalyzer,
      prepareAudioOperations,
      stopAudioOperations
    } = useMicController()

    const {
      userEnableAudio,
      userEnableVideo,
      userChangeMicGainValue,
    } = useUserSettings(store.state.user.id)

    return {
      on, off, events,
      changeMicLevel,
      setMicGainNode,
      micLevelDraw,
      micLevelAnalyzer,
      prepareAudioOperations,
      stopAudioOperations,
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      userSettings: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        micGainValue: userChangeMicGainValue
      }),
    }
  },
  data(){
    return {
      micLevelTimeout: undefined,
      rafID: undefined
    }
  },
  computed: {
    ...mapGetters('media', [
      'mediaStreamDevice',
      'mediaStreamLocal',
      'mediaStreamEcho',
      'mediaDevicesAudioList'
    ]),
    ...mapGetters('application', [
      'constants',
    ]),
    micValue(){
      return this.userSettings.micGainValue;
    },
    hasAudio () {
      return this.mediaDevicesAudioList.length > 0;
    },
    visualizeLocalStreamMic(){
      let conditions;

      if(this.currentUser.isParticipant && this.currentUser.isNotCalled){
        conditions = true;
      }else{
        conditions =
            !this.currentRoom.isActive ||
            !this.userSettings.enableAudio ||
            !this.hasAudio;
      }
      return conditions;
    },
    visualizeDeviceStreamMic(){
      let conditions =
          this.currentRoom.isActive &&
          this.userSettings.enableAudio &&
          this.hasAudio;

      conditions = conditions && (this.currentUser.isHost || !this.currentUser.isNotCalled)
      return conditions;
    },
    canVisualizeLocalStream(){
      return !!(this.visualizeLocalStreamMic && this.mediaStreamLocal);
    },
    canVisualizeDeviceStream(){
      return !!(this.visualizeDeviceStreamMic && this.mediaStreamDevice && this.mediaStreamDevice.getAudioTracks().length > 0);
    }

  },
  watch: {
    mediaStreamEcho(newVal){
      if(typeof newVal === 'object'){
        this.visualizeEchoTestStream()
      }
    },
    mediaStreamLocal(newVal){
      if(typeof newVal === 'object' && this.canVisualizeLocalStream){
        this.visualizeLocalStream();
      }
    }
    ,
    mediaStreamDevice(newVal){
      if(typeof newVal === 'object' && this.canVisualizeDeviceStream){
        this.visualizeDeviceStream();
      }
    },

    micValue(newVal, oldVal){
      if(oldVal !== undefined){
        newVal = parseInt(newVal);
        if(this.canVisualizeLocalStream){
          this.changeMicLevel(newVal);
        }
      }
    },
  },
  mounted(){
    this.init();
  },
  methods:{
    ...mapMutations('media', [
      'setMediaStreamDevice',
      'setMediaStreamLocal',
    ]),
    init(){
      if(this.canVisualizeLocalStream){
        this.visualizeLocalStream();
      }
      if(this.canVisualizeDeviceStream){
        this.visualizeDeviceStream();
      }
    },

    visualizeEchoTestStream(){
      if(this.rafID !== undefined){
        cancelAnimationFrame(this.rafID);
      }
      this.prepareAudioOperations(this.mediaStreamEcho, this.micValue);
      this.drawMicValue();
    },

    visualizeLocalStream(){
      if(this.rafID !== undefined){
        cancelAnimationFrame(this.rafID);
      }
      let stream;

      if(this.mediaStreamLocal && this.mediaStreamLocal.getAudioTracks().length > 0){
        stream = this.setMicGainNode(this.mediaStreamLocal, this.micGainValue);
      }else{
        stream = this.mediaStreamLocal;
      }
      this.prepareAudioOperations(stream, this.micValue);
      this.drawMicValue();
    },
    visualizeDeviceStream(){
      if(this.rafID !== undefined){
        cancelAnimationFrame(this.rafID);
      }
      this.prepareAudioOperations(this.mediaStreamDevice, this.micValue);
      this.drawMicValue();
    },

    drawMicValue(){
      if(this.$refs.mic !== undefined){
        this.rafID = requestAnimationFrame(this.drawMicValue);

        let canvasContext = this.$refs.mic.getContext("2d");

        canvasContext.clearRect(0, 0, this.$refs.mic.width, this.$refs.mic.height);
        canvasContext.fillStyle = '#a7f3d0';
        canvasContext.fillRect(0, 0, (Math.round(this.micLevelDraw()) * 1.5), 1500);
      }else{
        if(this.rafID !== undefined){
          cancelAnimationFrame(this.rafID);
        }
      }
    },

  },
  unmounted(){
    if(this.rafID !== undefined){
      cancelAnimationFrame(this.rafID);
    }
  }
};
</script>

<style scoped>
.tab-setting-mic-canvas{
  height: 5px;
  margin: 5px 0 0 0;
  background-color: #4d4d4d;
}
.tab-setting-mic-value{
  margin-top: 10px;
}
</style>