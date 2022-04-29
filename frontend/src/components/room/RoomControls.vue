<template>
  <div class="room-controls">
    <nav class="navbar navbar-light">
      <div class="left-controls">
        <button v-if="showStartButton" class="btn" @click="play">
          <span class="material-icons-outlined">play_circle</span>
        </button>
        <button v-if="showPauseButton" class="btn" @click="pause">
          <span class="material-icons-outlined">pause_circle</span>
        </button>
        <button v-if="showStopButton" class="btn" @click="stop">
          <span class="material-icons-outlined">stop_circle</span>
        </button>
        <span class="time">
          <span ref="hours">{{timer.hours}}</span>
          <span class="separator">:</span>
          <span ref="minutes">{{timer.minutes}}</span>
          <span class="separator">:</span>
          <span ref="seconds">{{timer.seconds}}</span>
        </span>
        <span v-if="currentUser.isParticipant && !currentUser.isCalled">
          <input :disabled="cantRaiseHand" v-model="toggleUserRaiseHand" type="checkbox"
                 id="room-controls-nav-rise-hand">
        <label for="room-controls-nav-rise-hand" class="material-icons">pan_tool</label>
        </span>
        <span v-if="currentUser.isParticipant && currentUser.isCalled" class="drop-call">
           <span @click="dropCall" class="material-icons flick">pan_tool</span>
        </span>
      </div>
      <button class="btn" @click="goToPlanner()">
        <span class="material-icons-outlined">logout</span>
      </button>
    </nav>
  </div>
  <modal-window ref="modalRoomFinish"
                id="modalRoomFinish"
                type="dialog"
                name="modalRoomFinish"
                @modal-result="modalResultHandler($event)">
    <template v-slot:message>Мероприятие будет завершено.
      Нажмите на кнопку «Завершить», чтобы подтвердить завершение мероприятия.
    </template>
    <template v-slot:button-text-ok>Завершить</template>
    <template v-slot:button-text-cancel>Вернуться</template>
  </modal-window>

  <modal-window ref="modalParticipantDropCallDialog"
                id="modalParticipantDropCallDialog"
                type="dialog"
                name="modalParticipantDropCallDialog"
                @modal-result="modalResultHandler($event)">
    <template v-slot:message>Завершить вызов?</template>
    <template v-slot:button-text-ok>Да</template>
    <template v-slot:button-text-cancel>Нет</template>
  </modal-window>
</template>

<script>
import {mapGetters, useStore} from "vuex";
import ModalWindow from '@/components/common/ModalWindow'
import api from "@/api";
import userApi from "@/api/user";
import useCurrentUserHandRise from "@/composables/users/useCurrentUserHandRise";
import useCountdownTimer from "@/composables/room/useCountdownTimer";
import {computed} from "vue"
import useHelpers from "@/composables/useHelpers";

export default {
  name: "RoomControls",
  components: {
    ModalWindow
  },
  setup() {
    const store = useStore()
    const {toggleUserRaiseHand, cantRaiseHand} = useCurrentUserHandRise()
    const {timer, clearInterval} = useCountdownTimer(store.getters["room/getEndDate"])
    const {goToPlanner} = useHelpers()

    return {
      toggleUserRaiseHand,
      cantRaiseHand,
      timer,
      clearInterval,
      currentUser: computed(() => store.getters["user/currentUser"]),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      goToPlanner
    }

  },
  data() {
    return {
      modal: {
        result: false
      },
      result: false,
    }
  },
  computed: {
    ...mapGetters('application', [
      'constants',
      'channelPublic',
    ]),
    ...mapGetters('room', [
      'roomStatusId',
    ]),
    showStartButton() {
      return this.currentUser.isHost &&
          (this.currentRoom.isPending || this.currentRoom.isPaused);
    },
    showPauseButton() {
      return this.currentUser.isHost && this.currentRoom.isActive;
    },
    showStopButton() {
      return this.currentUser.isHost && !this.currentRoom.isFinished;
    },
    modalResult() {
      return this.modal.result;
    },
    currentParticipantIsCalled () {
      return this.currentUser.isParticipant && this.currentUser.isCalled;
    },
  },
  watch: {
    modalResult(newVal) {
      if (newVal) {
        this.sendStatusChangeRequest('finish');
      }
    },
    roomStatusId(newVal) {
      if (newVal === this.constants.room.STATUS_EVENT_FINISHED) {
        this.eventFinishHandler();
      }
    },
  },
  methods: {
    modalResultHandler(data) {
      if (data.name === "modalRoomFinish") {
        this.modal.result = data.result;
      }

      if(data.name === "modalParticipantDropCallDialog" && data.result){
        userApi.dropCall(this.currentUser.id);
      }
    },
    dropCall(){
      if(this.currentUser.isParticipant && this.currentUser.isCalled){
        this.$refs.modalParticipantDropCallDialog.show();
      }
    },
    play() {
      if (this.currentUser.isHost) {
        if (this.currentRoom.isPending) {
          this.start();
        }
        if (this.currentRoom.isPaused) {
          this.resume();
        }
      }
    },
    start() {
      this.sendStatusChangeRequest('start');
    },
    pause() {
      this.sendStatusChangeRequest('pause');
    },
    resume() {
      this.sendStatusChangeRequest('resume');
    },
    stop() {
      this.$refs.modalRoomFinish.show();
    },

    sendStatusChangeRequest(action) {
      if (this.currentUser.isHost) {
        api({
          method: 'POST',
          url: `/room/${action}`,
          data: {
            roomId: this.currentRoom.id
          },
        }).catch((data) => console.error(data));
      }
    },

    eventFinishHandler() {
      this.clearInterval()
    },
  },
}
</script>

<style scoped lang="scss">
nav.navbar {
  padding: 0;
  font-size: 1.5rem;
}

.room-controls {
  button {
    color: #fff;
    font-size: 1.5rem;
    padding: 0.25rem;
    line-height: 1;
  }

  button:focus {
    box-shadow: none;
  }

  button:hover {
    color: #999;
  }

  .time {
    padding: 0.25rem;
  }

}

#room-controls-nav-rise-hand {
  display: none;

  & + label {
    cursor: pointer;
    margin: 0 10px;
  }

  &:checked + label.material-icons {
    color: #6ee7b7;
  }

  &:disabled + label {
    color: #999;
    cursor: default;
  }

}

.drop-call {
  color: red;
  cursor: pointer;
  margin: 0 10px;
}

.flick{
  animation: fadeinout 2s linear forwards infinite;
}

@keyframes fadeinout {
  0%,100% { opacity: 0; }
  50% { opacity: 1; }
}
</style>