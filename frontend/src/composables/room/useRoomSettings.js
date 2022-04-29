import {useStore} from "vuex";
import {computed} from "vue";

const settingsNames = {
  ROOM_VIDEO_STRICT_MODE: "room.videoStrictMode",
  ROOM_PRES_STRICT_MODE: "room.presStrictMode",
  ROOM_BLOCK_PUBLIC_CHAT: "room.blockPublicChat",
  ROOM_BLOCK_PRIVATE_CHAT: "room.blockPrivateChat",
  ROOM_BLOCK_RAISE_HAND: "room.blockRaiseHand",
  ROOM_CURRENT_PRES_ID: "room.currentPresId",
  ROOM_CURRENT_SLIDE: "room.currentSlide",
  ROOM_ACTIVE_BOARD_ID: "room.activeBoardId",
  ROOM_USER_CALL_CONTROL: "room.userCallControl",
  ROOM_SOUND_RAISE_HAND: "room.soundRaiseHand",
  ROOM_SOUND_PUBLIC_CHAT_MESSAGE: "room.soundPublicChatMessage",
  ROOM_SOUND_PRIVATE_CHAT_MESSAGE: "room.soundPrivateChatMessage",
  ROOM_DRAW_MODE: "room.drawMode",
  ROOM_USER_CALL_DRAW_MODE: "room.userCallDrawMode",
  ROOM_ACTIVE_MOUNTPOINT_ID: "room.activeMountPointId",
  ROOM_SCREEN_CAPTURE_ACTIVE: "room.screenCaptureActive",
  ROOM_TYPE_IP_AUDIO_ON: "room.typeIpAudioOn",
  ROOM_CURRENT_V_PDF: "room.currentVPDF",
}

export default function () {
  const store = useStore()
  const room = store.getters["room/currentRoom"]

  const roomSettings = computed(() => ({
    enableSwitchVideo: !room.settings.videoStrictMode,
    enableSwitchSlide: !room.settings.presStrictMode,

    currentPresentationId: room.settings.currentPresId,
    currentPresentationSlide: room.settings.currentSlide,
    activeMountPointId: room.settings.activeMountPointId,

    enabledScreenCapture: room.settings.screenCaptureActive,
    enabledChatPublic: !room.settings.blockPublicChat,
    enabledChatPrivate: !room.settings.blockPrivateChat,
    enabledRaiseHand: !room.settings.blockRaiseHand,
    enabledUserCallControl: room.settings.userCallControl,
    enabledSoundMessageChatPublic: room.settings.soundPublicChatMessage,
    enabledSoundMessageChatPrivate: room.settings.soundPrivateChatMessage,
    enabledSoundRaiseHand: room.settings.soundRaiseHand,
    enabledDrawMode: room.settings.drawMode,
    enabledDrawModeUserCall: room.settings.userCallDrawMode,
    enabledIpRoomAudio: room.settings.typeIpAudioOn,
    enabledVPDF: Boolean(room.settings.currentVPDF),
  }))

  const changeSetting = (settingName, settingValue) =>
    store.dispatch('room/settings/changeSetting', {settingName, settingValue})
  const mutateSetting = (settingName, settingValue) =>
      store.commit('room/settings/changeSetting', {settingName, settingValue})

  return {
    roomSettings,
    settingsNames,
    changeSetting,
    mutateSetting,
    roomCurrentPresentationId: computed({
      get: () => roomSettings.value.currentPresentationId,
      set: vl => changeSetting(settingsNames.ROOM_CURRENT_PRES_ID, vl)
    }),
    roomCurrentPresentationSlide: computed({
      get: () => roomSettings.value.currentPresentationSlide,
      set: vl => changeSetting(settingsNames.ROOM_CURRENT_SLIDE, vl)
    }),
    roomActiveMountPointId: computed({
      get: () => roomSettings.value.activeMountPointId,
      set: vl => changeSetting(settingsNames.ROOM_ACTIVE_MOUNTPOINT_ID, vl)
    }),
    roomEnableSwitchVideo: computed({
      get: () => roomSettings.value.enableSwitchVideo,
      set: vl => changeSetting(settingsNames.ROOM_VIDEO_STRICT_MODE, !vl)
    }),
    roomEnableSwitchSlide: computed({
      get: () => roomSettings.value.enableSwitchSlide,
      set: vl => changeSetting(settingsNames.ROOM_PRES_STRICT_MODE, !vl)
    }),
    roomEnableScreenCapture: computed({
      get: () => roomSettings.value.enabledScreenCapture,
      set: vl => changeSetting(settingsNames.ROOM_SCREEN_CAPTURE_ACTIVE, vl)
    }),
    roomEnableChatPublic: computed({
      get: () => roomSettings.value.enabledChatPublic,
      set: vl => changeSetting(settingsNames.ROOM_BLOCK_PUBLIC_CHAT, !vl)
    }),
    roomEnableChatPrivate: computed({
      get: () => roomSettings.value.enabledChatPrivate,
      set: vl => changeSetting(settingsNames.ROOM_BLOCK_PRIVATE_CHAT, !vl)
    }),
    roomEnableRaiseHand: computed({
      get: () => roomSettings.value.enabledRaiseHand,
      set: vl => changeSetting(settingsNames.ROOM_BLOCK_RAISE_HAND, !vl)
    }),
    roomEnableUserCallControl: computed({
      get: () => roomSettings.value.enabledUserCallControl,
      set: vl => changeSetting(settingsNames.ROOM_USER_CALL_CONTROL, vl)
    }),
    roomEnableSoundMessageChatPublic: computed({
      get: () => roomSettings.value.enabledSoundMessageChatPublic,
      set: vl => changeSetting(settingsNames.ROOM_SOUND_PUBLIC_CHAT_MESSAGE, vl)
    }),
    roomEnableSoundMessageChatPrivate: computed({
      get: () => roomSettings.value.enabledSoundMessageChatPrivate,
      set: vl => changeSetting(settingsNames.ROOM_SOUND_PRIVATE_CHAT_MESSAGE, vl)
    }),
    roomEnableSoundRaiseHand: computed({
      get: () => roomSettings.value.enabledSoundRaiseHand,
      set: vl => changeSetting(settingsNames.ROOM_SOUND_RAISE_HAND, vl)
    }),
    roomEnableDrawMode: computed({
      get: () => roomSettings.value.enabledDrawMode,
      set: vl => changeSetting(settingsNames.ROOM_DRAW_MODE, vl)
    }),
    roomEnableDrawModeUserCall: computed({
      get: () => roomSettings.value.enabledDrawModeUserCall,
      set: vl => changeSetting(settingsNames.ROOM_USER_CALL_DRAW_MODE, vl)
    }),
    roomEnableIpRoomAudio: computed({
      get: () => roomSettings.value.enabledIpRoomAudio,
      set: vl => changeSetting(settingsNames.ROOM_TYPE_IP_AUDIO_ON, vl)
    }),
    roomEnableVPDF: computed({
      get: () => roomSettings.value.enabledVPDF,
      set: vl => changeSetting(settingsNames.ROOM_CURRENT_V_PDF, vl)
    })
  }
}

