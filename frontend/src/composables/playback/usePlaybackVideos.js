import {useStore} from "vuex";
import {computed, ref} from "vue";

export default function usePlaybackVideos(timeline = ref(0)) {
    const store = useStore()

    const playlist = computed(() => store.getters["playback/video/list"])
    const availableCalls = computed(() => store.getters["playback/video/availableCalls"](timeline.value))
    const availableHosts = computed(() => store.getters["playback/video/availableHosts"](timeline.value))
    const availableScreens = computed(() => store.getters["playback/video/availableScreens"](timeline.value))

    const active = computed(() => store.getters["playback/video/active"])
    const offset = computed(() => Math.max(timeline.value - active.value.time.start, 0))

    return {
        playlist,
        timeline,
        availableCalls,
        availableHosts,
        availableScreens,
        availableVideo: computed(() => [...availableHosts.value, ...availableCalls.value]),
        currentVideo: computed(() => ({...active.value, offset: offset.value})),
    }
}