import {reactive, computed} from "vue";
import {useStore} from "vuex";
import janusService from '@/services/janus'
import useCallbacks from '@/composables/janus/useCallbacks';
import useEchoTester from '@/composables/room/useEchoTester';
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useRoomSettings from '@/composables/room/useRoomSettings';
import{  TYPE_WEB_CAM_CALLED_USER,  TYPE_WEB_CAM_HOST} from '@/store/modules/playback/mountpoints';
import useCurrentUser from '@/composables/users/useCurrentUser';
import useUsersCall from '@/composables/users/useUsersCall';

export default function useJanusHandlers(){
  const calledUser = computed(() => store.getters["room/users/calledUser"]);
  const store = useStore();
  const {setJanusCallbacks} = useCallbacks();
  const {enumerateDevices} = useMediaHandlers()
  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const {currentUser, participantIsCalled, hostCanStream, userCanGetLocalStream, userCanGetDeviceStream, userAffectedByCallControl} = useCurrentUser()
  const {echoTestFinished} = useEchoTester()
  const {getMediaStream} = useMediaHandlers()
  const mediaStreamScreen = computed(() => store.getters['media/mediaStreamScreen'])
  const playerScreen = computed(() => store.getters['media/playerScreen'])
  const activeStreams = computed(() => store.getters['room/streams/activeStreams'])
  const mountPoints = computed(() => store.getters['application/mountPoints'])
  const {affectedByCallControl} = useUsersCall()

  const {
    roomEnableScreenCapture,
    activeMountPointId
  } = useRoomSettings()

  const roomSettings = reactive({
    screenCaptureActive: roomEnableScreenCapture,
    activeMountPointId
  })

  const initJanus = () => {
    if (store.getters['media/mediaStarted'] || !echoTestFinished) return false;
    store.commit('media/setMediaStarted', true);

    setJanusCallbacks();

    janusService.initJanus(() => {
      if (currentRoom.value.isActive) {
        if (hostCanStream.value || participantIsCalled.value ) {
          initJanusInDevice();
        }
        initJanusOutPrimary();
        if (calledUser.value) {
          initJanusOutCalled();
        }
      }
      if (userCanGetLocalStream.value) {
        enumerateDevices().then(() => {
          getMediaStream();
        });
      }
    });
  };

  const initJanusInDevice = () => {
    if (
      currentUser.value.isParticipant ||
      (currentUser.value.isHost && currentRoom.value.isWebCamRoom)
    ) {
      return janusService.initJanusInDevice(janusInDeviceReconnectCallback).then(() => {
        store.commit('media/setMediaDeviceReady', true);
        return true;
      }).catch((err) => {
        console.error('janus in init error', err);
      })
    }
  }
  const initJanusInScreen = () => {
    if (currentUser.value.isHost && currentRoom.value.isWebCamRoom ) {
      janusService.initJanusInScreen(janusInScreenReconnectCallback).then(() => {
        janusService.publishScreenCapture(mediaStreamScreen.value, playerScreen.value);
      }).catch((err) => {
        console.error('janus screen init error', err);
      })
    }
  }
  const initJanusOutPrimary = () => {
    janusService.initJanusOutPrimary(janusOutPrimaryReconnectCallback).then(janusOutReadyCallback).catch((err) => {
      console.error('janus out init error', err);
    });
  }
  const initJanusOutCalled = () => {
    janusService.initJanusOutCalled(janusOutCalledReconnectCallback).then(janusOutReadyCallback).catch((err) => {
      console.error('janus out init error', err);
    });
  }
  const initJanusOutScreen = () => {
    janusService.initJanusOutScreen(janusOutScreenReconnectCallback).then(() => {
      if(
        currentRoom.value.isActive &&
        roomSettings.screenCaptureActive
      ){
        janusService.watchScreenCaptureVideo();
      }
    }).catch((err) => {
      console.error('janus out init error', err);
    });
  }

  const janusInDeviceReconnectCallback = () => {
    if (userCanGetLocalStream.value) {
      enumerateDevices().then(() => {
        getMediaStream().then(() => {
          if (userCanGetDeviceStream.value) {
            janusService.forwardDeviceStream(currentUser.value.isHost ? TYPE_WEB_CAM_HOST : TYPE_WEB_CAM_CALLED_USER);
          }
        });
      });
    }
  }
  const janusInScreenReconnectCallback = () => {
    if(
      currentUser.value.isHost &&
      currentRoom.value.isActive &&
      roomSettings.screenCaptureActive
    ){
      janusService.publishScreenCapture(mediaStreamScreen, playerScreen);
    }
  }
  const janusOutPrimaryReconnectCallback = () => {
    if(userCanGetDeviceStream.value){
      janusService.forwardDeviceStream(TYPE_WEB_CAM_HOST);
    }
    janusService.switchStream(
      !!(calledUser.value || currentUser.value.isCalled)
    );
  }
  const janusOutCalledReconnectCallback = () => {
    if(userCanGetDeviceStream.value){
      janusService.forwardDeviceStream(TYPE_WEB_CAM_CALLED_USER);
    }
    janusService.switchStream(
      !!(calledUser.value || currentUser.value.isCalled)
    );
  }
  const janusOutScreenReconnectCallback = () => {
    if(
      currentRoom.value.isActive &&
      roomSettings.screenCaptureActive
    ){
      janusService.watchScreenCaptureVideo();
    }
  }

  const janusOutReadyCallback = () => {
    if(currentRoom.value.isActive){
      let localId = null;

      if(affectedByCallControl.value){
        if(currentRoom.value.isWebCamRoom){
          localId = mountPoints.value.web.host.id;
        }
        if(currentRoom.value.isIpCamRoom && activeStreams.value.length > 0){
          localId = activeStreams.value[0].mountpointId;
        }
      }else if(userAffectedByCallControl.value){
        localId = roomSettings.activeMountPointId
      }
      janusService.switchStream(
        !!(calledUser.value || currentUser.value.isCalled),
        localId
      )
    }
  }

  return {
    initJanus,
    initJanusInDevice,
    initJanusInScreen,
    initJanusOutPrimary,
    initJanusOutCalled,
    initJanusOutScreen,
  }
}