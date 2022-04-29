<template>
  <modal-window ref="modalRoomFinishedAlert"
                name="modalRoomFinishedAlert"
                @modal-result="modalResultHandler($event)"
                type="alert">
    <template v-slot:message>
      Мероприятие завершено. Нажмите на кнопку «ОК», чтобы вернуться к списку мероприятий.
    </template>
    <template v-slot:button-text-cancel>ОК</template>
  </modal-window>

  <modal-window ref="modalUserRejectCallAlert"
                type="alert">
    <template v-slot:message>Участник завершил вызов</template>
    <template v-slot:button-text-cancel>Ок</template>
  </modal-window>

</template>


<script>
import useMessageSubscription from "@/composables/useMessageSubscription";
import useHelpers from "@/composables/useHelpers";
import ModalWindow from '@/components/common/ModalWindow';
import {computed} from 'vue'
import {mapGetters, useStore} from 'vuex'
import useTimeoutSingleton from "@/composables/useTimeoutSingleton";
import usePrivateNotifications from "@/composables/users/usePrivateNotifications";

export default {
  name: 'ModalWindows',
  components: {ModalWindow},
  setup() {
    const store = useStore()
    const notify = usePrivateNotifications()
    const {on, off} = useMessageSubscription(store.getters["application/getChannels"])
    const {goToPlanner} = useHelpers()
    const {setTimeout} = useTimeoutSingleton()
    return {
      on, off,
      goToPlanner,
      currentUser: computed(() => store.getters["user/currentUser"]),
      setTimeout,
      notify
    }
  },
  computed: {
    ...mapGetters('application', [
      'constants',
    ]),
  },
  methods:{
    init(){
      this.messageSubscribe();
    },
    messageSubscribe(){
      this.on(this.constants.events['ROOM_REJECT_USER_CALL'], e => {
        this.eventRejectUserCallHandler(e.data);
      }),
      this.on(this.constants.events['EVENT_FINISH'], e => {
        this.eventFinishHandler(e.data);
      })
    },
    eventFinishHandler(){
      this.$refs.modalRoomFinishedAlert.show();
    },
    modalResultHandler(data){
      if (data.name === "modalRoomFinishedAlert") {
        this.goToPlanner();
      }
    },
    eventRejectUserCallHandler(data){
      if(this.currentUser.isHost){
        if(!data.timeout){
          this.notify.participantRejectedCall(data.userId);
          this.$refs.modalUserRejectCallAlert.show();

          this.setTimeout(() => {
            this.$refs.modalUserRejectCallAlert.hide();
          }, 3000);
        }else{
          this.notify.participantResolveCallTimeout(data.userId);
        }
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>

</style>