import {useStore} from "vuex";
import {watch, computed, onMounted} from "vue";
import useVideoElement from "@/composables/playback/video/useVideoElement";
import playbackService from "@/services/playback";
import {EVENT_FINISHED} from "@/services/playback/PlaybackService";

export const DEFAULT_VIDEO_ID = 'video'

export default function (id = DEFAULT_VIDEO_ID) {
    const store = useStore()
    const {ready, element: videoElement, currentTime, videoEvents, src, progress, duration} = useVideoElement(id)

    const playing = computed({
        get: () => store.state.playback.playing,
        set: vl => store.commit("playback/playing", vl)
    })

    const waiting = computed({
        get: () => store.getters["playback/waiting"],
        set: vl => store.commit("playback/waiting", vl)
    })

    const controls = {
        promise: undefined,
        play() {
            this.playPromise = videoElement.play().catch(e => console.error(e))
        },
        pause() {
            return this.playPromise?.then(() => videoElement.pause())
        },
        stop() {
            this.pause().then(() => {
                videoElement.pause()
                videoElement.load()
            })
        },
        seek(time) {
            console.log(videoElement)
            videoElement.currentTime = time

            console.log({time})
        }
    }

    // waiting: { ... video: false }
    watch(ready, videoReady => waiting.value = {[id]: !videoReady}, {immediate: true})
    watch(waiting, isWait => isWait ? controls.pause() : playing.value ? controls.play() : controls.pause())
    watch(playing, isPlay => isPlay ? controls.play() : controls.pause())
    playbackService.addEventListener(EVENT_FINISHED, () => controls.stop())

    onMounted(() => {
        if (!waiting.value && playing.value && videoElement.paused) {
            controls.play()
        }
    })

    return {
        waiting,
        playing,
        controls: {
            play: () => playing.value = true,
            pause: () => playing.value = false,
            toggle: () => playing.value = !playing.value,
            stop,
            seek: controls.seek,
        },
        video: {
            events: videoEvents,
            element: videoElement,
            ready,
            src,
            progress,
            duration,
            currentTime,
        },
    }
}