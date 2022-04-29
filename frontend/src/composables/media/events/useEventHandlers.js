import useMessageSubscription from '@/composables/useMessageSubscription';
import {useStore} from 'vuex'
import userApi from "@/api/user";
import janusService from '@/services/janus'
import JanusServer from '@/services/janus/servers/JanusServer';
import useMediaHandlers from '@/composables/media/useMediaHandlers';
import useCurrentUser from '@/composables/users/useCurrentUser';
import useJanusHandlers from '@/composables/janus/useJanusHandlers';
import usePrivateNotifications
  from '@/composables/users/usePrivateNotifications';
import useSounds from '@/composables/useSounds';
import useTimeoutSingleton from '@/composables/useTimeoutSingleton';
import useCurrentRoom from '@/composables/room/useCurrentRoom';

export default function useEventHandlers(){
  const store = useStore()
  const { on } = useMessageSubscription(store.getters['application/getChannels']);
  const {clearMediaStreams,enumerateDevices,getMediaStream,sourceChangeEvent} = useMediaHandlers()
  const {userCanGetLocalStream,participantIsWaitingForCall} = useCurrentUser()
  const {initJanusInDevice, initJanusOutPrimary,initJanusOutCalled} = useJanusHandlers()
  const constants = store.getters['application/constants']
  const {currentUser} = useCurrentUser()
  const {currentRoom} = useCurrentRoom()
  const notify = usePrivateNotifications()
  const {playUserCalledSound} = useSounds()
  const {setTimeout, clearTimeout} = useTimeoutSingleton()

  const callResolveTimeout = 60000

  on(constants.events['EVENT_START'], () => {
    eventStartHandler()
  })
  on(constants.events['EVENT_PAUSE'], () => {
    eventPauseHandler()
  })
  on(constants.events['EVENT_RESUME'], () => {
    eventResumeHandler()
  })
  on(constants.events['EVENT_FINISH'], () => {
    eventFinishHandler()
  })
  on(constants.events['ROOM_CALL_USER'], e => {
    eventRoomCallUserHandler(e.data);
  })
  on(constants.events['USER_PARTICIPANT_STREAM'], e => {
    eventUserParticipantStreamHandler(e.data);
  })
  on(constants.events['ROOM_DROP_USER_CALL'], e => {
    eventDropUserCallHandler(e.data);
  })
  on(constants.events['ROOM_REJECT_USER_CALL'], e => {
    eventRejectUserCallHandler(e.data);
  })

  const getMediaStreamHandler = () => {
    if(userCanGetLocalStream.value){
      enumerateDevices().then(() => {
        getMediaStream();
      });
    }
  }

  const changedToActiveHandler = () => {
    getMediaStreamHandler()

    if(currentUser.value.isHost && currentRoom.value.isWebCamRoom){
      initJanusInDevice();
    }
    initJanusOutPrimary();
  }

  const eventStartHandler = () => changedToActiveHandler()

  const eventPauseHandler = () => {
    clearMediaStreams();
    store.commit('media/setMediaDeviceReady', false);
    janusService.clearPlayers();
    janusService.stopLocalTracks();
    janusService.destroyAllJanusServers();
    getMediaStreamHandler()
  }

  const eventResumeHandler = () => changedToActiveHandler()

  const eventFinishHandler = () => {
    janusService.clearPlayers();
    janusService.destroyAllJanusServers();
  }

  const eventRoomCallUserHandler = (data) => {
    if(currentUser.value.isHost){
      notify.hostCalledParticipant(data.userId);
    }
    if(currentUser.value.isParticipant && (currentUser.value.id === data.userId)){
      playUserCalledSound();
      store.commit('user/call/setCallDialogStatus', true);
      setTimeout(() => {
        userApi.rejectCall(currentUser.value.id, true)
      }, callResolveTimeout);
    }
  }
  const eventUserParticipantStreamHandler = (data) => {
    if(currentUser.value.isHost){
      notify.participantAcceptedCall(data.userId);
    }
    initJanusOutCalled();
  }
  const eventRejectUserCallHandler = (data) => {
    if(currentUser.value.isParticipant && (currentUser.value.id === data.userId)){
      userApi.dropCall(currentUser.value.id);
    }
  }
    const eventDropUserCallHandler = (data) => {
    if(currentUser.value.isHost && data.triggeredUserId !== null){
      if(data.triggeredUserId === data.userId){
        notify.participantDroppedCall(data.userId);
      }
      if(data.triggeredUserId === currentUser.value.id){
        notify.hostDroppedCall(data.userId);
      }
    }
    if(currentUser.value.isParticipant && (currentUser.value.id === data.userId)){
      store.commit('user/call/setCallDialogStatus', false);
      janusService.stopDeviceCapture();
      janusService.destroyJanus(JanusServer.BASE_TYPE_IN, JanusServer.TYPE_DEVICE);
      clearMediaStreams();
      store.commit('media/setMediaDeviceReady', false);
      sourceChangeEvent();
    }
    janusService.destroyJanus(JanusServer.BASE_TYPE_OUT, JanusServer.TYPE_CALLED);
  }

  const modalParticipantCallDialogHandler = async (result) => {
    if(participantIsWaitingForCall.value){
      clearTimeout();
      if(result.result){
        janusService.setParticipantReadyCallback(sourceChangeEvent);
        initJanusInDevice();
      }else{
        userApi.rejectCall(currentUser.value.id);
      }
      store.commit('user/call/setCallDialogStatus', false);
    }
  }

  return {
    modalParticipantCallDialogHandler
  }
}