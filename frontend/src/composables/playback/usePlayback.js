import {computed, ref, watch} from "vue";
import {useStore} from "vuex";
import StubEmitter from "@/composables/playback/controls/StubEmitter";
import useIntervalSingleton from "@/composables/useIntervalSingleton";
import playbackService from "@/services/playback";
import {
    EVENT_CANPLAY,
    EVENT_FINISHED,
    EVENT_WAITING,
    EVENT_SEEKING,
} from "@/services/playback/PlaybackService";

const timeline = ref(0)
const emitter = new StubEmitter()
const {setInterval, clearInterval} = useIntervalSingleton()

export default function usePlayback() {
    const store = useStore()
    const duration = computed(() => store.getters["playback/duration"])

    const playing = computed({
        get: () => store.state.playback.playing,
        set: vl => store.commit("playback/playing", vl)
    })

    const waiting = computed({
        get: () => store.getters["playback/waiting"],
        set: vl => store.commit("playback/waiting", vl)
    })

    const int2time = (stamp) => {
        let seconds = Math.floor(stamp % 60).toString().padStart(2, "0"),
            minutes = Math.floor(stamp / 60 % 60).toString().padStart(2, "0"),
            hours = Math.floor(stamp / 3600 % 24).toString().padStart(2, "0");
        return [hours, minutes, seconds].join(":")
    }

    const time = computed(() => ({
        current: int2time(timeline.value / 1000),
        duration: int2time(duration.value / 1000)
    }))

    const play = () => {
        // if (!waiting.value) {
            clearInterval()
            setInterval(() => timeline.value += 100, 100, true)
        // }
    }

    const pause = () => {
        clearInterval()
    }

    const stop = () => {
        clearInterval()
        timeline.value = 0
        playing.value = false
    }

    const seek = time => timeline.value = time

    playbackService.addEventListener(EVENT_WAITING, () => waiting.value = {events: true})
    playbackService.addEventListener(EVENT_CANPLAY, () => waiting.value = {events: false})
    playbackService.addEventListener(EVENT_FINISHED, () => stop())
    playbackService.addEventListener(EVENT_SEEKING, event => seek(event.seek))

    watch(waiting, isWaiting => isWaiting ? pause() : playing.value ? play() : pause())
    watch(playing, isPlaying => isPlaying ? play() : pause())

    return {
        duration,
        timeline,
        playing,
        waiting,
        time,
        eventSource: emitter,
        controls: {
            play: () => playing.value = true,
            pause: () => playing.value = false,
            toggle: () => playing.value = !playing.value,
            stop,
        },
        progress: computed(() => Math.round(timeline.value / duration.value * 100))
    }
}