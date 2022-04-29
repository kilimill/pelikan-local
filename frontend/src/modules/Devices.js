
export default {

  checkPermissions () {
    //in case user agent has no permissions api, we count that as true.
    if (!navigator.permissions) {
      return new Promise(() => {
        return {
          audio: true,
          video: true,
        };
      });
    }

    let micPermissionPromise
      = navigator.permissions.query({ name: 'microphone' });
    let cameraPermissionPromise
      = navigator.permissions.query({ name: 'camera' });
    return Promise.all([micPermissionPromise, cameraPermissionPromise]).
      then((values) => {
        return {
          audio: values[0].state === 'granted',
          video: values[1].state === 'granted',
        };
      });
  },

  enumerateDevices (audioList, videoList) {
    return navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      return this.gotDevices(devices, audioList, videoList);
    }).catch((error) => {
      console.error(error);
    });
  },

  gotDevices (deviceInfos, audioList, videoList) {
    let audioSelected, videoSelected;
    for (let i = 0; i !== deviceInfos.length; ++i) {
      let deviceInfo = deviceInfos[i];
      if(deviceInfo.deviceId === ""){
        continue;
      }
      if (deviceInfo.kind === 'audioinput') {
        audioList.push({
          id: deviceInfo.deviceId,
          value: deviceInfo.deviceId,
          label: deviceInfo.label
        });
        if(audioList.length === 1){
          audioSelected = audioList[0].value;
        }
      } else if (deviceInfo.kind === 'videoinput') {
        videoList.push({
          id: deviceInfo.deviceId,
          value: deviceInfo.deviceId,
          label: deviceInfo.label
        });
        if(videoList.length === 1){
          videoSelected = videoList[0].value;
        }
      }
    }
    return {
      audio: audioSelected,
      video: videoSelected
    }
  },

  getStoredDevices (audioList, videoList, currentAudioDeviceId, currentVideoDeviceId) {

    let audioVal = sessionStorage.getItem('Pelikan.echoTest.audioSelected');
    let videoVal = sessionStorage.getItem('Pelikan.echoTest.videoSelected');

    if(
      audioVal
      && this.checkDeviceInArray(
        audioVal,
        audioList
      )
    ){
      currentAudioDeviceId = audioVal;
    }
    if(
      videoVal
      && this.checkDeviceInArray(
        videoVal,
        videoList
      )
    ){
      currentVideoDeviceId = videoVal;
    }

    return {
      audio: currentAudioDeviceId,
      video: currentVideoDeviceId
    };
  },

  checkDeviceInArray (id, array) {
    for (const item of array) {
      if(item.value === id){
        return true;
      }
    }
    return false;
  },

  storeSelectedDevices (audioValue, videoValue) {
    sessionStorage.setItem('Pelikan.echoTest.audioSelected', audioValue);
    sessionStorage.setItem('Pelikan.echoTest.videoSelected', videoValue);
  },

  removeSelectedDevices () {
    if(sessionStorage.getItem('Pelikan.echoTest.audioSelected')){
      sessionStorage.removeItem('Pelikan.echoTest.audioSelected');
    }
    if(sessionStorage.getItem('Pelikan.echoTest.videoSelected')){
      sessionStorage.removeItem('Pelikan.echoTest.videoSelected');
    }
  },

  getMediaConstraints (
    userHasAudio, userHasVideo, audioDeviceId = '', videoDeviceId = '') {
    let audio = false, video = false;

    if (userHasAudio && audioDeviceId) {
      audio = {
        deviceId: {
          exact: audioDeviceId,
        },
      };
    }

    if (userHasVideo && videoDeviceId) {
      video = {
        deviceId: {
          exact: videoDeviceId,
        },
      };
    }

    return {
      audio: audio,
      video: video,
    };
  },

  devicesChangeHandler (userHasAudio, userHasVideo, audioDeviceId = '', videoDeviceId = '') {
    this.storeSelectedDevices(audioDeviceId, videoDeviceId);
    let constraints
      = this.getMediaConstraints(
      userHasAudio,
      userHasVideo,
      audioDeviceId,
      videoDeviceId);

    if(!userHasAudio || !userHasVideo){
      return false;
    }

    return this.getUserMedia(constraints);
  },

  getUserMedia (constraints) {
      return navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        return stream;
      });
  },

  /**
   * Returns formatted value for audio gain node.
   * @param value
   * @returns {number}
   */
  getGainVal(value){
    return (value + value) / 100;
  },

  /**
   *
   * @returns {*}
   */
  getScreenMedia () {
    return navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true
    }).then((stream) => {
        return stream;
    });
  }




}