import {
  useStore
} from 'vuex'
import {
  computed,
  watch
} from "vue"
import messageService from "@/services/message"
import janusService from "@/services/janus"
import roomApi from "@/api/room";
import userApi from "@/api/user";
import useCurrentUser from '@/composables/users/useCurrentUser';
import useDeviceHandlers from '@/composables/media/useDeviceHandlers';
import useCurrentRoom from '@/composables/room/useCurrentRoom';
import useCallbacks from '@/composables/janus/useCallbacks';
import useMicController from '@/composables/tabs/useMicController';
import useUserSettings from '@/composables/users/useUserSettings';
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useHelpers from '@/composables/useHelpers';

export default function useEchoTestHandlers() {

  const store = useStore()
  const {
    currentUser
  } = useCurrentUser()
  const {
    currentRoom
  } = useCurrentRoom()
  const calledUser = computed(() => store.getters["room/users/calledUser"])
  const echoTestStarted = computed(() => store.getters["echoTest/started"])
  const {
    setJanusCallbacks
  } = useCallbacks()
  const {
    setMicGainNode,
    changeMicLevel
  } = useMicController()
  const {
    goToPlanner
  } = useHelpers()

  const {
    getUserMedia,
    checkPermissions,
    enumerateDevices,
    getMediaConstraints,
    storeSelectedDevices
  } = useDeviceHandlers()

  const {
    hasAudio,
    hasVideo,
    selectedAudio,
    selectedVideo
  } = useMediaHandlers()

  const alertShow = computed(() => store.getters["echoTest/alertShow"])
  const alertType = computed(() => store.getters["echoTest/alertType"])
  const alertMsg = computed(() => store.getters["echoTest/alertMsg"])

  const hasWebRTC = computed(() => {
    return !!window.RTCPeerConnection !== false
  })

  const hasMessages = computed(() => {
    return store.getters["echoTest/messagesTest"];
  })

  const modalMsg = computed(() => {
    return store.getters["echoTest/modalMsg"]
  })

  const modalShow = computed(() => {
    return store.getters["echoTest/modalShow"]
  })
  const getChannels = store.getters["application/getChannels"]

  const permissionAudio = computed(() => {
    return store.getters["media/permissionAudio"]
  })
  const permissionVideo = computed(() => {
    return store.getters["media/permissionVideo"]
  })

  const testParams = {
    messagesToSent: 2,
    messagesReceived: 0,
    timeToWaitMs: 2000
  }

  const mediaStreamEcho = computed(() => {
    return store.getters["media/mediaStreamEcho"]
  })

  watch(mediaStreamEcho, newVal => {
    if (typeof newVal === 'object') {
      janusService.createEchoTestOffer(newVal)
    }
  })

  const {
    userChangeMicGainValue,
  } = useUserSettings(store.state.user.id)

  watch(userChangeMicGainValue, newVal => {
    changeMicLevel(newVal);
  })

  const checkMessages = () => {
    let messages = new Promise((resolve) => {
      let count = 0;
      messageService.subscribe(getChannels, subscription => {
        subscription.on('connect', () => {
          roomApi.sendEchoTestMessages(getChannels[count++], 1);
        });

        let callbackSub = async (message) => {
          let data = await message.data.message;
          if (data.text === 'test') {
            testParams.messagesReceived++;
          }
          if (testParams.messagesReceived === testParams.messagesToSent) {
            store.commit('echoTest/setMessagesTest', true);

            clearTimeout(timeout);
          }
          subscription.off('publish', callbackSub)
          return resolve(true);
        }

        subscription.on('subscribe');
        subscription.on('publish', callbackSub);
      });
    });

    let timeout = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(false);
      }, testParams.timeToWaitMs);
    });

    return Promise.race([
      messages,
      timeout
    ]).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
  const userAcceptResult = () => store.commit("echoTest/userAccepted", true)

  const isDisableConnectButton = computed(() => {
    return !store.getters['echoTest/finished'] || store.getters['echoTest/failed']
  })

  const initialChecks = async () => {
    if (!hasWebRTC.value) {
      store.commit("echoTest/setModalMsg",
        "Для корректной работы необходимо использовать веб-браузер с поддержкой технологии WebRTC.");
      store.commit("echoTest/setFailed", true);
      store.commit("echoTest/setModalShow", true);
      return false;
    }

    let test = await checkMessages();
    if (!test) {
      store.commit("echoTest/setModalMsg",
        "Проверка возможности обмена сообщениями завершена с ошибкой. Пожалуйста, обратитесь к системному администратору.");
      store.commit("echoTest/setFailed", true);
      store.commit("echoTest/setModalShow", true);
      return false;
    }
    return true;
  }

  const initEchoTest = async () => {
    try {
      if (currentUser.value.isParticipant) {
        if (currentUser.value.isCalled) {
          userApi.dropCall(currentUser.value.id, false);
        }
        roomApi.sendEchoTestResults(
          0,
          0,
          true
        );
      }
      if (currentUser.value.isHost && calledUser.value) {
        userApi.dropCall(calledUser.value.id, false);
      }

      if (echoTestStarted.value) {
        throw new Error('echo test already started!');
      }

      store.commit('echoTest/setStarted', true)

      if (!await initialChecks()) {
        throw new Error('initial checks failed!');
      }

      //this is mostly for the first-time visitors, for system dialog about permissions to appear
      await getUserMedia({
        audio: true,
        video: true
      }).catch(err => console.error(err));

      if (currentUser.value.isHost && currentRoom.value.isIpCamRoom) {
        echoTestFinished();
      } else {
        await checkPermissions().then((result) => {
          store.commit('media/setPermission', {
            type: 'audio',
            value: result.audio
          });
          store.commit('media/setPermission', {
            type: 'video',
            value: result.video
          });
        });

        if (
          currentUser.value.isHost &&
          (!permissionAudio.value || !permissionVideo.value)
        ) {
          store.commit('echoTest/setAlertMsg', "Для продолжения работы необходимо открыть доступ к камере и микрофону!");
          store.commit('echoTest/setAlertType', "alert-danger");
          store.commit('echoTest/setAlertShow', true);
          throw new Error('host media permissions not granted!');
        }

        if (
          currentUser.value.isParticipant &&
          !permissionAudio.value && !permissionVideo.value
        ) {
          store.commit('echoTest/setAlertMsg', "Вы можете подключиться без поддержки аудио и видео.");
          store.commit('echoTest/setAlertType', "alert-secondary");
          store.commit('echoTest/setAlertShow', true);
          echoTestFinished();
        } else {
          await enumerateDevices().then((media) => {
            store.commit('media/setMediaDevices', media)
          }).catch(err => console.error(err))
          initJanus(echoTestPluginLoadCallback);
        }
      }
    } catch (e) {
      console.error(e);
      store.commit('echoTest/setFailed', true);
      store.commit('echoTest/setFinished', true);
    }
  }

  const initJanus = (successCallback) => {
    setJanusCallbacks();
    janusService.initEchoTestJanus(successCallback);
  }

  const publishMedia = () => {
    let constr = getMediaConstraints(
      hasAudio,
      hasVideo,
      selectedAudio.value,
      selectedVideo.value,
    );
    getUserMedia(constr).then((stream) => {
      if (stream.getAudioTracks().length > 0) {
        stream = setMicGainNode(stream, userChangeMicGainValue.value || 0);
      }
      store.commit('media/setMediaStreamEcho', stream);
      echoTestFinished();
    }).catch((error) => {
      handleGUMErrors(error);
    });
  }

  const echoTestPluginLoadCallback = () => {
    publishMedia()
  }

  const sourceChangeEvent = () => {
    if (store.getters['echoTest/finished']) {
      storeSelectedDevices(selectedAudio.value, selectedVideo.value);

      publishMedia()
    }
  }

  const handleGUMErrors = (error) => {
    console.error(error);
    store.commit('echoTest/setFinished', true);
    store.commit('echoTest/setEchoTestResults', {
      hasAudio: 0,
      hasVideo: 0,
      finished: false
    })

    if (error.name === 'NotFoundError') {
      if (currentUser.value.isHost) {
        store.commit('echoTest/setFailed', true);
        store.commit('echoTest/setAlertMsg', "Чтобы провести мероприятие,\n вам необходимо подключить камеру и микрофон, и открыть к ним доступ.");
        store.commit('echoTest/setAlertType', "alert-danger");
      }
      if (currentUser.value.isParticipant) {
        store.commit('echoTest/setAlertMsg', "Если вы планируете выступать на мероприятии,\n то вам необходимо подключить камеру и микрофон, и открыть к ним доступ.");
        store.commit('echoTest/setAlertType', "alert-warning");
      }

      store.commit('echoTest/setAlertShow', true);
    } else {
      genericErrorProcessing();
    }
  }

  const genericErrorProcessing = () => {
    if (currentUser.value.isHost) {
      store.commit('echoTest/setFailed', true);
      store.commit('echoTest/setAlertMsg', "Подключиться невозможно, проверьте сеть или обратитесь в тех. поддержку");
      store.commit('echoTest/setAlertType', "alert-danger");

    }

    if (currentUser.value.isParticipant) {
      store.commit('echoTest/setAlertMsg', "Произошла ошибка при проверке оборудования,\n Вы можете подключиться, но ведущий не сможет вызвать вас во время мероприятия.");
      store.commit('echoTest/setAlertType', "alert-warning");
      store.commit('echoTest/setEchoTestResults', {
        hasAudio: 0,
        hasVideo: 0,
        finished: true
      })
    }

    store.commit('echoTest/setAlertShow', true);
  }


  const echoTestFinished = () => {

    store.commit('echoTest/setEchoTestResults', {
      hasAudio: hasAudio && permissionAudio.value,
      hasVideo: hasVideo && permissionVideo.value,
      finished: true
    })
  }

  const goToRoom = async () => {
    if (currentUser.value.isParticipant) {
      await roomApi.sendEchoTestResults(
        store.getters['echoTest/resultsAudio'] ? 1 : 0,
        store.getters['echoTest/resultsVideo'] ? 1 : 0,
        true
      );
    }
    userAcceptResult()
  }

  return {
    hasAudio,
    hasVideo,
    selectedAudio,
    selectedVideo,
    hasWebRTC,
    hasMessages,
    initialChecks,
    initEchoTest,
    modalMsg,
    modalShow,
    isDisableConnectButton,
    alertShow,
    alertType,
    alertMsg,
    sourceChangeEvent,
    goToRoom,
    goToPlanner,
  }
}