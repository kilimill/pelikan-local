
// import videoElementControls from "@/composables/playback/video/videoElementControls";
// import {computed} from "vue";
//import usePlayback from "@/composables/playback/usePlayback";

let promiseList = [],
promiseAnswers = new Map(),
counter = {
  check: true,
  num: 0
}

const timing = (element, screenCapture, playing) => {
  console.log(!element?.value || promiseAnswers.get(element.value) || playing.value === true)
  if (!element?.value || promiseAnswers.get(element.value) || playing.value === true) {
    return
  }
  
  if (counter.check) {
    counter.num = screenCapture ? 2 : 1
  }
  
  let promise = {}
  promise = new Promise((res, rej) => {
    promiseAnswers.set(element.value, {
      resolve: res,
      reject: rej
    })
  })

  promiseList.push(promise)

  console.log(promiseList.length)
  console.log(element.value)
  console.log(counter.num)
  
  element.value.addEventListener('canplay', canPlayHandler)
  checkPromiseAmount(false, playing)
  
  
  function canPlayHandler() {
    // console.log(promiseAnswers)
    console.log(element.value.src)
    promiseAnswers.get(element.value).resolve();
    element.value.removeEventListener('canplay', canPlayHandler)
  }
  
}

const checkPromiseAmount = (tre = false, playing) => {
  if (tre) {
    counter.check = false;
    counter.num = 1;
  }
  if (promiseList.length == counter.num) {
    Promise.all(promiseList).then(() => {
      // const { playing: playbackPlaying } = usePlayback();
      console.log(123123132132)
      // for (let promise of promiseAnswers.keys()) {
        // const controls = videoElementControls(computed(() => promise))
        // controls.play()
      // }
      console.log(playing.value)
      // playing.value = true
      promiseList = []
      promiseAnswers.clear()
      counter = {
        check: true,
        num: 0
      }
    })
  }
}

export {
  timing,
  checkPromiseAmount
}