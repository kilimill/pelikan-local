import {useStore} from "vuex";
import {computed} from "vue";
import {mapValues} from "lodash";

const settingsNames = mapValues({
    USER_AUDIO_ON: "user.audioOn",
    USER_VIDEO_ON: "user.videoOn",
    USER_BLOCK_PRIVATE_CHAT: "user.blockPrivateChat",
    USER_BLOCK_PUBLIC_CHAT: "user.blockPublicChat",
    USER_BLOCK_RAISE_HAND: "user.blockRaiseHand",
    USER_HAS_AUDIO: "user.hasAudio",
    USER_HAS_VIDEO: "user.hasVideo",
    USER_MIC_GAIN_VALUE: "user.micGainValue",
    USER_SCREEN_CAPTURE_ON: "user.hostScreenCapture",
    USER_ENABLE_TOOLTIPS: 'user.enableTooltips'
}, value => value.replace(/^[^.]+\./, ''))

export default function (userId) {
    const store = useStore()
    const user = store.getters["room/users/findUser"](userId)

    const userSettings = computed(() => ({
        enabledAudio: Boolean(user?.settings[settingsNames.USER_AUDIO_ON]),
        enabledVideo: Boolean(user?.settings[settingsNames.USER_VIDEO_ON]),
        enabledScreenCapture: Boolean(user?.settings[settingsNames.USER_SCREEN_CAPTURE_ON]),
        enabledPrivateChat: !user?.settings[settingsNames.USER_BLOCK_PRIVATE_CHAT],
        enabledPublicChat: !user?.settings[settingsNames.USER_BLOCK_PUBLIC_CHAT],
        enabledRaiseHand: !user?.settings[settingsNames.USER_BLOCK_RAISE_HAND],
        micGainValue: Number(user?.settings[settingsNames.USER_MIC_GAIN_VALUE]),
        enabledTooltips: user?.settings[settingsNames.USER_ENABLE_TOOLTIPS]
    }))

    const changeSetting = (settingName, settingValue) => {
        settingName = settingName.replace(/^([^.]+\.)?/, 'user.')
        return store.dispatch('room/users/changeSetting', {userId, settingName, settingValue})
    }

    return {
        userSettings,
        changeSetting,
        userEnableAudio: computed({
            get: () => userSettings.value.enabledAudio,
            set: vl => changeSetting(settingsNames.USER_AUDIO_ON, vl)
        }),
        userEnableVideo: computed({
            get: () => userSettings.value.enabledVideo,
            set: vl => changeSetting(settingsNames.USER_VIDEO_ON, vl)
        }),
        userEnablePrivateChat: computed({
            get: () => userSettings.value.enabledPrivateChat,
            set: vl => changeSetting(settingsNames.USER_BLOCK_PRIVATE_CHAT, !vl)
        }),
        userEnablePublicChat: computed({
            get: () => userSettings.value.enabledPublicChat,
            set: vl => changeSetting(settingsNames.USER_BLOCK_PUBLIC_CHAT, !vl)
        }),
        userEnableRaiseHand: computed({
            get: () => userSettings.value.enabledRaiseHand,
            set: vl => changeSetting(settingsNames.USER_BLOCK_RAISE_HAND, !vl)
        }),
        userChangeMicGainValue: computed({
            get: () => userSettings.value.micGainValue,
            set: vl => changeSetting(settingsNames.USER_MIC_GAIN_VALUE, vl)
        }),
        userEnableScreenCapture: computed({
            get: () => userSettings.value.enabledScreenCapture,
            set: vl => changeSetting(settingsNames.USER_SCREEN_CAPTURE_ON, vl)
        }),
        userEnableTooltips: computed({
            get: () => userSettings.value.enabledTooltips,
            set: vl => changeSetting(settingsNames.USER_ENABLE_TOOLTIPS, vl)
        })
    }
}