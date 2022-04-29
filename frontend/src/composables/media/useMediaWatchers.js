import {computed, watch} from "vue"
import {useStore} from 'vuex'
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useRoomSettings from '@/composables/room/useRoomSettings';
import JanusServer from '@/services/janus/servers/JanusServer';
import useJanusHandlers from '@/composables/janus/useJanusHandlers';
import janusService from '@/services/janus'
import useCurrentUser from '@/composables/users/useCurrentUser';


export default function useMediaWatchers(){

  const store = useStore()
  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const {hostCanCaptureScreen} = useCurrentUser()

  const {startScreenCapture, sourceChangeEvent} = useMediaHandlers()
  const {initJanusOutScreen, initJanusInScreen} = useJanusHandlers()

  const mediaStreamScreen = computed(() => store.getters['media/mediaStreamScreen'])
  const mediaStreamDevice = computed(() => store.getters['media/mediaStreamDevice'])
  const mediaDeviceReady = computed(() => store.getters['media/mediaDeviceReady'])
  const mediaAudioSelected = computed(() => store.getters['media/mediaDevicesAudioSelected'])
  const mediaVideoSelected = computed(() => store.getters['media/mediaDevicesVideoSelected'])

  const {
    roomEnableScreenCapture,
  } = useRoomSettings()

  watch(hostCanCaptureScreen, (newVal) => {
    if (newVal) {
      startScreenCapture();
    }
  })

  watch(roomEnableScreenCapture, (newVal) => {
    if(newVal){
      if(currentRoom.value.isActive){
        initJanusOutScreen();
      }
    }else {
      janusService.destroyJanus(JanusServer.BASE_TYPE_OUT, JanusServer.TYPE_SCREEN);
    }
  })

  watch(mediaStreamDevice, (newVal) => {
    if(typeof newVal === 'object' && mediaDeviceReady.value && currentRoom.value.isActive){
      janusService.publishOwnStream(newVal);
    }
  });

  watch(mediaStreamScreen, (newVal) => {
    if(typeof newVal === 'object'){
      console.log('mediaStreamScreen changed.');
      initJanusInScreen();
    }else{
      janusService.destroyJanus(JanusServer.BASE_TYPE_IN, JanusServer.TYPE_SCREEN);
    }
  });

  watch(mediaDeviceReady, (newVal) => {
    if(newVal && currentRoom.value.isActive && mediaStreamDevice.value !== undefined){
      janusService.publishOwnStream(mediaStreamDevice.value);
    }
  });

  watch(mediaAudioSelected, (newVal, oldVal) => {
    if(oldVal !== undefined){
      sourceChangeEvent();
    }
  });

  watch(mediaVideoSelected, (newVal, oldVal) => {
    if(oldVal !== undefined){
      sourceChangeEvent();
    }
  });

}