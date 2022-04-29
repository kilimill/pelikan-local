import {
    computed,
    ref,
    watch
} from "vue";
import videoElementControls from "@/composables/playback/video/videoElementControls";
// let nullPath = undefined
const collection = []
const elements = (() => {
    const find = src => collection.find(i => i.src === src)
    const make = src => {
        const element = document.createElement('video')
        element.autoplay = false
        element.controls = false
        element.src = src
        // if (src == null) {
        //     nullPath = element.src;
        //     // console.log(nullPath)
        // }
        collection.push(element)
        return element
    }

    return function (src) {
        return find(src) || make(src)
    }
})()

/**
 *
 * @param {Ref<String>} src,
 * @param {Ref<String>} timeline
 */
export default function (src, timeline, screenCapture) {
    // console.log(src.value)\
    const currentElement = computed(() => elements(src.value))
    const controls = videoElementControls(currentElement, screenCapture)
    const currentTime = ref(0)
    const duration = ref(0)
    //const timeline = ref(0)
    let playing = ref(false)
    const canPlay = ref(false)
    let waitHandler = () => canPlay.value = false,
        playHandler = () => {
            if (playing.value) {
                controls.play()
            }
            canPlay.value = true
        },
        timeHandler = () => {
            currentTime.value = currentElement.value.currentTime * 1000
        },
        loadHandler = () => {
            duration.value = currentElement.value.duration * 1000
            // console.log('CHEEECK')
            // console.log(currentElement)
            // prom.resolve();
        },
        errorHandler = event => {
            event.preventDefault()
            canPlay.value = false
            console.error(event)
        }

    watch(currentElement, (newElement, oldElement) => {
        // console.log(src.value)
        // playing.value = false
        // console.log(playing.value)
        // if (src.value !== null) {
            //     console.log(playing)
        //     const currentVideo = computed(() => playlist.value.find((i) => i.link === currentElement.value.src))
        //     let time = timeline.value - currentVideo.value.time.start
        //     console.log(timeline.value)
        //     console.log(currentVideo)
        //     console.log(currentElement)
        //     if(time < 0) {
        //         time = timeline.value
        //         timeline.value = timeline.value + currentVideo.value.time.start
        //         // console.log(timeline.value + currentVideo.value.time.start)
        //     }
        //     // console.log(currentVideo.value) 
        //     // console.log(currentVideo.value.time)
        //     // console.log(timeline.value < currentVideo.value.time.end && time > 0)
        //     if(timeline.value > currentVideo.value.time.start && timeline.value < currentVideo.value.time.end) {
        //         console.log(time)
        //         controls.seek(time)
        //     }
        // }
        
        // const prom = promises(currentElement, screenCapture, controls, src.value)
        
        
        if (oldElement === undefined) {
            return
        }
        // playing = ref(false)

        try {
            oldElement.removeEventListener('timeupdate', timeHandler)
            oldElement.removeEventListener('canplaythrough', playHandler)
            oldElement.removeEventListener('waiting', waitHandler)
            oldElement.removeEventListener('loadeddata', loadHandler)
            oldElement.removeEventListener('error', errorHandler)
            oldElement.pause()
        } catch (error) {
            console.error("VideoElement: oldElement exception", error)
        }
        newElement.addEventListener('timeupdate', timeHandler)
        newElement.addEventListener('canplaythrough', playHandler)
        newElement.addEventListener('waiting', waitHandler)
        newElement.addEventListener('loadeddata', loadHandler)
        newElement.addEventListener('error', errorHandler)
        newElement.currentTime = timeline.value / 1000


        canPlay.value = newElement.readyState > 2

        if (canPlay.value && playing.value) {
            canPlay.value = true
            controls.play()
        }

    }, {
        immediate: true
    })

    return {
        src,
        playing,
        canPlay,
        timeline,
        currentElement,
        currentTime,
        controls: {
            play: () => {
                playing.value = true
                controls.play()
            },
            pause: () => {
                if (playing.value) {
                    playing.value = false
                    controls.pause()
                }
            },
            seek: controls.seek,
            waiting: controls.waiting
        }
    }
}

export {collection}