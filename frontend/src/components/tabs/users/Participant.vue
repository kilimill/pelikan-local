<template>
  <div v-if="!isHost || !isCurrent" class="user accordion-item">
    <div class="user-header accordion-header">
      <button v-if="hostCanCallUser" class="btn"
              :disabled="!participant.hasAudio && !participant.hasVideo"
              :class="{highlight: participant.handRaised, isCalling: isCalled, 'cant-rise-hand': cantUserRiseHand}"
              :title="isCalled ? '' : 'Вызвать'"
              @click="toggleCall">
        <span class="material-icons" :class="{'flick': isResolvingCall}">{{ isCalled ? 'online_prediction' : 'pan_tool' }}</span>
      </button>
      <button v-if="currentUserIsHost || !currentUserIsHost && isHost" class="btn"
              :class="{highlight: highlightMessage}"
              @click.prevent.stop="toPrivateChat">
        <span class="material-icons">textsms</span>
      </button>
      <div class="accordion-button collapsed" aria-expanded="false" role="button" data-bs-toggle="collapse"
           :class="{'cant-expand': !expand}" :data-bs-target="`#collapse-${participant.id}`"
           aria-controls="collapseOne">
        <span class="user-name" :class="{'text-danger': isHost}">{{ participant.alias }}</span>
      </div>
    </div>
    <div v-if="expand" :id="`collapse-${participant.id}`" class="accordion-collapse collapse"
         aria-labelledby="headingOne"
         data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <span class="material-icons">{{ participant.hasAudio ? 'mic' : 'mic_off' }}</span>
        <span class="material-icons">{{ participant.hasVideo ? 'videocam' : 'videocam_off' }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import {mapActions} from "vuex";
import {computed, reactive} from "vue";
import {useStore} from "vuex";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useUsersCall from "@/composables/users/useUsersCall";
import useUserSettings from "@/composables/users/useUserSettings";
import useCurrentUserHandRise from "@/composables/users/useCurrentUserHandRise";

/**
 * @property {Function} changeCurrentTab
 */
export default {
  name: "User",
  props: {
    participant: {
      type: Object,
      required: true
    },
    expand: {
      type: Boolean,
      default: false,
    }
  },
  inject: ['changeCurrentTab'],
  setup(props) {
    const store = useStore()

    const {userIsHost, userIsCurrent} = useUsersRepository()
    const {canCallUser, toggleCall, userIsCalled, userIsResolvingCall} = useUsersCall()
    const {blockRoomRaiseHand} = useCurrentUserHandRise()
    const highlightMessage = computed(() => Boolean(~store.state.room.users.highlight.indexOf(props.participant.id)))

    const {
      userSettings,
      userEnableAudio,
      userEnableVideo,
      userEnablePrivateChat,
      userEnablePublicChat,
      userChangeMicGainValue,
      userEnableScreenCapture,
      userEnableRaiseHand
    } = useUserSettings(props.participant.id)

    return {
      toggleCall: () => toggleCall(props.participant.id),
      canToggleCall: computed(() => canCallUser.value || userIsCalled(props.participant.id)),
      isCalled: computed(() => store.state.room.users.called?.id === props.participant.id),
      isResolvingCall: computed(() => userIsResolvingCall(props.participant.id)),
      isHost: userIsHost(props.participant.id),
      currentUserIsHost: userIsHost(store.state.user.id),
      isCurrent: userIsCurrent(props.participant.id),
      highlightMessage,
      userSettings,
      blockRoomRaiseHand,
      settingsModels: reactive({
        enableAudio: userEnableAudio,
        enableVideo: userEnableVideo,
        enablePrivateChat: userEnablePrivateChat,
        enablePublicChat: userEnablePublicChat,
        changeMicGainValue: userChangeMicGainValue,
        enableScreenCapture: userEnableScreenCapture,
        enableRaiseHand: userEnableRaiseHand,
      }),
      currentRoom: computed(() => store.getters["room/currentRoom"]),
      currentUser: computed(() => store.getters["room/currentUser"]),
      props: props.participant
    }
  },
  computed: {
    cantUserRiseHand() {
      return !this.settingsModels.enableRaiseHand || this.blockRoomRaiseHand
    },
    hostCanCallUser(){
      return this.currentUserIsHost && this.currentRoom.isActive;
    }
  },
  methods: {
    ...mapActions('room/users', {changeUserSetting: 'changeSetting'}),
    toPrivateChat() {
      this.changeCurrentTab('TabChat', {userId: this.participant.id})
    },
  }
}
</script>

<style lang="scss" scoped>
@import "src/assets/scss/theme";

$accordion-button-color: #fff;
$disabled-button-color: #999;

.accordion-button {
  background-color: transparent;
  box-shadow: none;
  padding: 3px 5px;
  color: $accordion-button-color;
  font-size: 15px;

  .user-name {
    margin: 5px;
  }

  &:focus {
    border: none;
    box-shadow: none;
  }

  &::after {
    width: 15px;
    height: 15px;
    background-size: 15px;
  }

  &:not(.collapsed) {
    color: $accordion-button-color;
    background-color: transparent;
    box-shadow: none;

    &::after {
      background-image: escape-svg($accordion-button-icon);
    }
  }

  &.cant-expand {
    cursor: default;

    &::after {
      background-image: none;
    }
  }
}

.accordion-header {
  display: flex;
  flex-direction: row;

  button {
    padding: 0;
    margin: 5px;
    color: #fff;
    cursor: pointer;

    &:disabled,
    &.device-off,
    &.cant-rise-hand {
      color: $disabled-button-color;
    }

    &.highlight {color: $highlight}
    &.isCalling {color: yellow}
    &:focus {box-shadow: none}
  }
}

.accordion-body {
  color: $accordion-button-color;
}

.accordion-item {
  background-color: transparent;
  border: none;
  border-bottom: 1px dashed #4d4d4d;
}

.material-icons {
  font-size: 1.4rem;
}

.participant-settings {
  font-size: 14px;
}

.flick{
  animation: fadeinout 2s linear forwards infinite;
}

@keyframes fadeinout {
  0%,100% { opacity: 0; }
  50% { opacity: 1; }
}

</style>