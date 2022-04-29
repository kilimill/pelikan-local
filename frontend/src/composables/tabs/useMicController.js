import {onUnmounted} from "vue";


export default function useMicController() {

  let audioGainNode = undefined;
  let analyser = undefined;
  let microphone = undefined;
  let javascriptNode = undefined;

  onUnmounted(() => {
    stopAudioOperations()
  })

  /**
   *
   * @param value
   * @returns {number}
   */
  const getGainVal = (value) => {
    return (value + value) / 100;
  }

  /**
   *
   * @param value
   */
  const changeMicLevel = (value) => {
    let val = getGainVal(value);
    if (audioGainNode !== undefined && (val >= 0 && val <= 2)) {
        audioGainNode.gain.value = val;
    }
  }

  /**
   *
   * @param stream
   * @param value
   * @returns {*}
   */
  const setMicGainNode = (stream, value = 0) => {

    let audioContext = new AudioContext();

    audioGainNode = audioContext.createGain();

    let audioSource = audioContext.createMediaStreamSource(stream);
    let audioDestination = audioContext.createMediaStreamDestination();

    audioSource.connect(audioGainNode);
    audioGainNode.connect(audioDestination);
    audioGainNode.gain.value = getGainVal(value);

    if(stream.getVideoTracks()[0]){
      stream = new MediaStream([
        stream.getVideoTracks()[0],
        audioDestination.stream.getAudioTracks()[0]
      ]);
    }else{
      stream = new MediaStream([
        audioDestination.stream.getAudioTracks()[0]
      ]);
    }

    return stream;
  }

  /**
   *
   * @returns {number}
   */
  const micLevelDraw = () => {
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;

    let length = array.length;
    for (let i = 0; i < length; i++) {
      values += (array[i]);
    }

    return values / length;
  }

  /**
   *
   * @param stream
   */
   const micLevelAnalyzer = (stream) => {
    let audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    //TODO refactor this: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
  }

  /**
   *
   * @param stream
   * @param micValue
   * @returns {*}
   */
  const prepareAudioOperations = (stream, micValue) => {
    micLevelAnalyzer(stream);
    changeMicLevel(micValue);
    micLevelDraw();
    return stream;
  }

  const stopAudioOperations = () => {

    audioGainNode = undefined;
    analyser = undefined;
    microphone = undefined;
    javascriptNode = undefined;
  }

  return {
    micLevelDraw,
    micLevelAnalyzer,
    changeMicLevel,
    setMicGainNode,
    prepareAudioOperations,
    stopAudioOperations
  }
}