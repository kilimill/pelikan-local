<template>
  <div id="echo-test-page">
    <div id="echo-test-block">
      <h3>Проверка работы оборудования</h3>
      <p v-if="mustPassEchoTest" class="top-text">Включите в браузере доступ к вашему оборудованию</p>
      <p class="device-support">
        <span :class="{'no-device':!hasWebRTC}">
          <span class="material-icons">{{hasWebRTC ? 'check_circle_outline' : 'highlight_off'}}</span>
          Поддержка видео и аудио
        </span>
        <span :class="{'no-device':!hasMessages}">
          <span class="material-icons">{{hasMessages ? 'check_circle_outline' : 'highlight_off'}}</span>
          Поддержка сообщений
        </span>
      </p>
      <div>
        <div v-if="mustPassEchoTest">

        <drop-down-select
            v-model="selectedVideo"
            @change="sourceChangeEvent($event)"
            :options="listVideo"/>
        <video autoplay ref="player"></video>
        <drop-down-select
            v-model="selectedAudio"
            @change="sourceChangeEvent($event)"
            :options="listAudio"/>
          <div class="mic-control-container">
            <mic-control />
          </div>
        <div>
          <div v-if="alertShow" class="alert-message" :class="alertType">
            {{alertMsg}}
          </div>
        </div>
        </div>
        <div class="connect-buttons">
          <button @click="goToRoom()" :disabled="isDisableConnectButton">Подключиться</button>
          <button @click="goToPlanner()">Вернуться</button>
        </div>

      </div>
    </div>
  </div>
  <modal-window ref="modalEchoTestError"
                id="modalEchoTestError"
                type="alert">
    <template v-slot:message>{{ modalMsg }}</template>
    <template v-slot:button-text-cancel>Вернуться</template>
  </modal-window>
</template>

<script>
import ModalWindow from '@/components/common/ModalWindow';
import MicControl from '@/components/tabs/settings/MicControl';
import DropDownSelect from "@/components/common/DropDownSelect";
import janusService from "@/services/janus";
import JanusServer from '@/services/janus/servers/JanusServer';
import useCurrentUser from '@/composables/users/useCurrentUser';
import useEchoTestHandlers from '@/composables/echo/useEchoTestHandlers';
import {mapGetters} from 'vuex'
import useMessageSubscription from '@/composables/useMessageSubscription';
import store from '@/store';

export default {
  name: 'EchoTest',
  components: {
    DropDownSelect,
    ModalWindow,
    MicControl
  },
  setup() {
    const { mustPassEchoTest} = useCurrentUser()
    const echoTestHandlers = useEchoTestHandlers()
    const {messageSub} = useMessageSubscription(store.getters["application/getChannels"])
    messageSub()
    return {
      mustPassEchoTest,
      ...echoTestHandlers,
    }
  },
  computed: {
    ...mapGetters('media', [
      'listAudio',
      'listVideo',
    ]),
  },
  watch: {
    modalShow(newVal){
      if(newVal){
        this.$refs.modalEchoTestError.show();
      }
    },
  },
  mounted () {
    janusService.setPlayer('echo',this.$refs.player);
    this.init();
  },
  methods: {
    async init(){
      await this.initEchoTest();
    },
  },
  unmounted(){
    janusService.unsetPlayer('echo');
    janusService.destroyJanus(JanusServer.BASE_TYPE_IN, JanusServer.TYPE_ECHO);
  }
};
</script>

<style scoped>
#echo-test-block{
  max-width: 400px;
  background: #666;
  margin: 30px auto;
  height: 96vh;
  border-radius: 10px;
  padding: 25px;
  color: #fff;
  position: relative;
}
#echo-test-block h3{
  font-size: 1.4rem;
  margin-bottom: 10px;
}
#echo-test-block p{
  margin-bottom: 20px;
}
#echo-test-mic{
  height: 3px;
  width: 100%;
  background: #4d4d4d;
  float: left;
  margin: 5px 0;
}
.top-text{
  border: 1px solid #fff;
  border-radius: 5px;
  padding: 10px;
}
#echo-test-page{
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 100vh;
  align-items: center;
}
.device-support .no-device{
  color: #999;
}
.device-support{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.connect-buttons{
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  left: 0;
}
.connect-buttons button{
  background: #222;
  padding: 15px 20px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  border: 0;
  margin: 15px 5px;
}
.connect-buttons button[disabled]{
  background: #4d4d4d;
  color: #666;
  cursor: default;
}
.connect-buttons button:hover{
  background: #4d4d4d;
}
.alert-message{
  border-width: 1px;
  border-style: solid;
  border-radius: 5px;
  padding: 10px;
  background: rgba(255,255,255,0);
  float: left;
  margin: 10px 0;
}
.alert-danger{
  border-color: #ffabab;
  color: #ffabab;
}
.alert-warning{
  border-color: #fff292;
  color: #fff292;
}
.alert-secondary{
  border-color: #a7f3d0;
  color: #a7f3d0;
}
video{
  width: 90%;
  margin: 10px auto;
}
.mic-control-container{
  display: flex;
  flex-direction: column;
}
</style>