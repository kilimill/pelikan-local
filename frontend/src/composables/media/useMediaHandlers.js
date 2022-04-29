import {useStore} from 'vuex'
import {computed, reactive} from "vue"
import useDeviceHandlers from '@/composables/media/useDeviceHandlers';
import useUserSettings from '@/composables/users/useUserSettings';
import useMicController from '@/composables/tabs/useMicController';
import userApi from "@/api/user";
import {
  PREDEFINED_CONTENT_BACKGROUND,
} from '@/store/modules/room/content';
import roomApi from "@/api/room";
import useCurrentUser from '@/composables/users/useCurrentUser';


export default function useMediaHandlers(){

  const currentRoom = computed(() => store.getters["room/currentRoom"])
  const {currentUser, participantIsWaitingForCall, userCanGetDeviceStream} = useCurrentUser()

  const store = useStore()

  const {
    enumerateDevices: deviceEnumerateDevices,
    getMediaStream: deviceGetMediaStream,
    getFilteredStream,
    devicesChangeHandler,
    getScreenMedia,
    getUserMedia
  } = useDeviceHandlers()

  const audioList = []
  const videolist = []

  const hasAudio = computed(() => Boolean(store.getters['media/mediaDevicesAudioList']))
  const hasVideo = computed(() => Boolean(store.getters['media/mediaDevicesVideoList']))
  const mediaAudioSelected = computed(() => store.getters['media/mediaDevicesAudioSelected'])
  const mediaVideoSelected = computed(() => store.getters['media/mediaDevicesVideoSelected'])
  const mediaDevicesAudioList = computed(() => store.getters['media/mediaDevicesAudioList'])
  const mediaDevicesVideoList = computed(() => store.getters['media/mediaDevicesVideoList'])
  const {setMicGainNode, changeMicLevel} = useMicController()

  const {
    userEnableAudio,
    userEnableVideo,
    userChangeMicGainValue
  } = useUserSettings(store.state.user.id)

  const userSettings = reactive({
    enableAudio: userEnableAudio,
    enableVideo: userEnableVideo,
    micGainValue: userChangeMicGainValue
  })

  const startScreenCapture = async () => {
    if (
      currentUser.value.isHost
      && currentRoom.value.isActive
      && navigator.mediaDevices
      && navigator.mediaDevices.getDisplayMedia
    ) {
      await getScreenMedia(mediaAudioSelected.value).then(
        (stream) => {
          getUserMedia({
            audio: {
              deviceId:{
                exact: mediaAudioSelected.value
              }
            },
            video: false
          }).then((streamAudio) => {
            stream.addTrack(streamAudio.getAudioTracks()[0]);

            stream.getVideoTracks()[0].addEventListener('ended', () => {
              store.commit('media/setMediaStreamScreen' ,undefined);
            })

            if(currentUser.value.isHost){
              store.commit('media/setMediaStreamScreen' ,stream);
              roomApi.toggleScreenCapture(true);
            }
          });
        }).catch(() => {
        store.commit('room/content/selectedContentValue', PREDEFINED_CONTENT_BACKGROUND)
        store.commit('media/setMediaStreamScreen' ,undefined);
      });
    }
  }

  const enumerateDevices = async () => {
    await deviceEnumerateDevices(audioList, videolist).then((media) => {
      store.commit('media/setMediaDevices', media)
    }).catch((error) => console.error(error));
  }

  const getMediaStream = async () => {
    if(mediaDevicesAudioList.value.length === 0 || mediaDevicesVideoList.value.length === 0){
      return false;
    }
    await deviceGetMediaStream()
    .then((data) => {
      if(data?.stream){
        streamHandler(data.stream);
      }
      store.commit('media/setMediaReady', true);
      if(data?.media){
        store.commit('media/setMediaDevices', data.media);
      }

    }).catch((error) => console.error(error));
  }

  const streamHandler = (localStream) => {
    if(userCanGetDeviceStream.value){
      let stream = getFilteredStream(
        userSettings.enableAudio,
        userSettings.enableVideo,
        localStream
      );

      if(stream.getAudioTracks().length > 0){
        stream = setMicGainNode(stream, userSettings.micGainValue);
      }

      store.commit('media/setMediaStreamDevice', stream);
    }
    store.commit('media/setMediaStreamLocal', localStream);
  }

  const sourceChangeEvent = () => {
    devicesChangeHandler(
      hasAudio.value,
      hasVideo.value,
      mediaAudioSelected.value,
      mediaVideoSelected.value
    ).then((localStream) => {
      if(localStream){
        streamHandler(localStream);
      }
      if(participantIsWaitingForCall.value){
        userApi.sendParticipantStreamEvent();
      }
    }).catch((error) => {
      console.error(error);
      if(participantIsWaitingForCall.value){
        userApi.dropCall(currentUser.value.id);
      }
    });
  }

  const clearMediaStreams = () => {
    store.commit('media/setMediaStreamEcho', undefined)
    store.commit('media/setMediaStreamDevice', undefined)
    store.commit('media/setMediaStreamScreen', undefined)
  }

  return{
    enumerateDevices,
    hasAudio: hasAudio.value,
    hasVideo: hasVideo.value,
    listAudio: computed(() => store.getters['media/mediaDevicesAudioList']),
    listVideo: computed(() => store.getters['media/mediaDevicesVideoList']),
    selectedAudio: computed({
      get: () => store.getters['media/mediaDevicesAudioSelected'],
      set: vl => store.commit('media/setAudioSelected',vl)
    }),
    selectedVideo: computed({
      get: () => store.getters['media/mediaDevicesVideoSelected'],
      set: vl => store.commit('media/setVideoSelected',vl)
    }),
    getMediaStream,
    changeMicLevel,
    sourceChangeEvent,
    startScreenCapture,
    clearMediaStreams
  }
}