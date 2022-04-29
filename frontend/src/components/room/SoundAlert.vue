<template>
  <audio ref="raiseHandPlayer" />
  <audio ref="messagePlayer" />
</template>

<script>
import useMessageSubscription from '@/composables/useMessageSubscription';
import useTimeoutSingleton from '@/composables/useTimeoutSingleton';
import useRoomSettings from '@/composables/room/useRoomSettings';
import { useStore,mapGetters } from 'vuex';
import { reactive, computed } from 'vue';

import soundCommon from '@/assets/wav/handup.wav';

export default {
  name: 'SoundAlert',
  data(){
    return{
      soundRaiseTimeout: false,
      soundMessageTimeout: false,
      soundTimeoutMs: 5000
    }
  },
  setup () {
    const store = useStore();
    const { on, off } = useMessageSubscription(store.getters['application/getChannels']);
    const currentUser = computed(() => store.getters['user/currentUser']);
    const {setTimeout} = useTimeoutSingleton()


    const {
      roomEnableSoundMessageChatPublic,
      roomEnableSoundMessageChatPrivate,
      roomEnableSoundRaiseHand,
    } = useRoomSettings();

    return {
      on, off,
      roomSettings: reactive({
        soundRaiseHand: roomEnableSoundRaiseHand,
        soundPublicChatMessage: roomEnableSoundMessageChatPublic,
        soundPrivateChatMessage: roomEnableSoundMessageChatPrivate,
      }),
      currentUser,
      setTimeout
    };
  },
  computed: {
    ...mapGetters('application', [
      'constants',
    ]),
    canPlaySoundRaiseHand(){
      return !this.soundRaiseTimeout;
    },
    canPlaySoundMessage(){
      return !this.soundMessageTimeout;
    },
    hostCanHearAlerts () {
      return this.currentUser.isHost;
    },
    hostCanHearAlertRaiseHand () {
      return this.hostCanHearAlerts && this.roomSettings.soundRaiseHand && this.canPlaySoundRaiseHand;
    },
    hostCanHearAlertMessagePublic () {
      return this.hostCanHearAlerts && this.roomSettings.soundPublicChatMessage && this.canPlaySoundMessage;
    },
    hostCanHearAlertMessagePrivate () {
      return this.hostCanHearAlerts && this.roomSettings.soundPrivateChatMessage && this.canPlaySoundMessage;
    },

  },
  methods: {
    messageSubscribe () {
      this.on(this.constants.events['ROOM_TOGGLE_RAISE_HAND'], e => {
        if (this.hostCanHearAlertRaiseHand && e.data.handRaised === 1) {
          this.eventRaiseHandHandler();
        }
      });
      this.on(this.constants.events['ROOM_MESSAGE_PUBLIC'], e => {
        if (this.hostCanHearAlertMessagePublic && (this.currentUser.id !== e.data.userId)) {
          this.eventMessageHandler();
        }

      });
      this.on(this.constants.events['ROOM_MESSAGE_PRIVATE'], e => {
        if (this.hostCanHearAlertMessagePrivate && (this.currentUser.id !== e.data.userId)) {
          this.eventMessageHandler();
        }
      });
    },
    eventRaiseHandHandler () {
      this.soundRaiseTimeout = true;
      this.$refs.raiseHandPlayer.play();
      setTimeout(() => {
        this.soundRaiseTimeout = false;
      }, this.soundTimeoutMs)
    },
    eventMessageHandler () {
      this.soundMessageTimeout = true;
      this.$refs.messagePlayer.play();
      setTimeout(() => {
        this.soundMessageTimeout = false;
      }, this.soundTimeoutMs)
    },
  },
  mounted () {
    this.$refs.raiseHandPlayer.src = soundCommon;
    this.$refs.messagePlayer.src = soundCommon;
    this.messageSubscribe();
  },
};
</script>

<style scoped>

</style>