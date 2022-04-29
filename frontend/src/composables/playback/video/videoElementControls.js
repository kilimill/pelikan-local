import {
    watch,
    computed
} from "vue";
import {
    timing
} from "@/composables/playback/video/timingPlayers.js";
import {
    useStore
} from "vuex";

import {collection} from "@/composables/playback/video/videoElement";
/**
 *
 * @param {ComputedRef<HTMLVideoElement>} element
 * @return {{play: Function, stop: Function, pause: Function}}
 */
let regerg = [];
let arr = new Map();
export default function (element) {
    const store = useStore()
    let promiseList = {}
    let elementId = null

    watch(element, value => {
        elementId = value.src
        arr.set(elementId, element)
    }, {
        immediate: true
    })

    const play = () => {
        // console.log(elementId)
        // console.log(element)
        promiseList[elementId] = element.value.play()
            .catch(e => console.error(e))
        // console.log(element._value.src)
        // if (element._value.src !== 'https://frontend.pelikan.online:8443/null') {
        // }
    }
    
    const pause = () => {
        if (promiseList[elementId]) {
            regerg.push(element)
            console.log(elementId)
            console.log(promiseList)
            promiseList[elementId].then(() => element.value.pause())
            // promiseList[elementId] = element.value.play()
        }
    }

    const playing = computed({
        get: () => store.state.playback.playing,
        set: vl => store.commit("playback/playing", vl)
    })

    const playlist = computed(() => store.getters["playback/video/list"])
    const active = computed(() => store.getters["playback/video/active"])

    const stop = () => console.log('stop: ', elementId)
    const waiting = (time, seek, generalTime) => {
        // console.log(generalTime)
        // console.log(promiseList)
        // console.log('generalTimegeneralTime')
        const currentVideo = computed(() =>
            playlist.value.filter((i) => i.type === "screen" && i.time.start <= generalTime && i.time.end > generalTime)
        );
        let screenCapture = currentVideo.value.length ? true : false
        // console.log();
        // console.log(playlist.value);
        // let screenCapture = computed(() => store.getters["room/settings/screenCaptureActive"])
        // console.log(generalTime)
        // console.log(elementId)
        // console.log(seek === 0)
        // console.log(regerg[regerg.length - 1] )
        // console.log(screenCapture)
        const availableCalls = computed(() => store.getters["playback/video/availableCalls"](generalTime))
        const availableHosts = computed(() => store.getters["playback/video/availableHosts"](generalTime))
        const availableScreens = computed(() => store.getters["playback/video/availableScreens"](generalTime))
        console.log(availableCalls.value)
        console.log(availableHosts.value)
        console.log(availableScreens.value)
        // setTimeout(() => {
        // console.log(screenCapture)
        setTimeout(() => console.log('active', active.value))
        
        if (seek === 0 && screenCapture) {
            console.log('TTTTTTTTTTTTTTTTTTTT')
            setTimeout(() => console.log('regerg', regerg))
            setTimeout(() => {
                timing(regerg[regerg.length - 1], screenCapture, playing, time)
                let n = regerg[regerg.length - 1].value.currentTime
                regerg[regerg.length - 1].value.currentTime = n
                regerg = []
            })
        //     console.log(regerg)
        //     console.log(regerg[regerg.length - 1] == element)
        //     regerg[regerg.length - 1] == element ? timing(regerg[regerg.length - 2], screenCapture, playing, time) : timing(regerg[regerg.length - 1], screenCapture, playing, time)
        //     // timing(regerg[regerg.length - 1], screenCapture, playing, time)
        }
        timing(element, screenCapture, playing, time)
        
        element.value.currentTime = time / 1000
        // }, 1000)
    };
    const seek = (time, seek, generalTime) => {
        // console.log(generalTime)
        // console.log(promiseList)
        // console.log('generalTimegeneralTime')
        const currentVideo = computed(() =>
            playlist.value.filter((i) => i.type === "screen" && i.time.start <= generalTime && i.time.end > generalTime)
        );
        let screenCapture = currentVideo.value.length ? true : false
        // console.log();
        // console.log(playlist.value);
        // let screenCapture = computed(() => store.getters["room/settings/screenCaptureActive"])
        // console.log(generalTime)
        // console.log(elementId)
        // console.log(seek === 0)
        // console.log(regerg[regerg.length - 1] )
        // console.log(screenCapture)
        const availableCalls = computed(() => store.getters["playback/video/availableCalls"](generalTime))
        const availableHosts = computed(() => store.getters["playback/video/availableHosts"](generalTime))
        const availableScreens = computed(() => store.getters["playback/video/availableScreens"](generalTime))
        console.log(availableCalls.value)
        console.log(availableHosts.value)
        console.log(availableScreens.value)
        // setTimeout(() => {
        // console.log(screenCapture)
        setTimeout(() => console.log('active', active.value))
        
        const find = src => collection.find(i => i.src === src)
        if (screenCapture) {
            console.log('TTTTTTTTTTTTTTTTTTTT')
            setTimeout(() => console.log('regerg', regerg))
            setTimeout(() => {
                let ptr = computed(() => find(availableScreens.value[0].link))
                console.log(ptr)
                console.log(ptr.value.currentTime)
                timing(ptr, screenCapture, playing, time)
                
                let t = generalTime - availableScreens.value[0].time.start;
                console.log(t)
                // let n = ptr.value.currentTime
                ptr.value.currentTime = t / 1000
                regerg = []
            }, 1000)
        //     console.log(regerg)
        //     console.log(regerg[regerg.length - 1] == element)
        //     regerg[regerg.length - 1] == element ? timing(regerg[regerg.length - 2], screenCapture, playing, time) : timing(regerg[regerg.length - 1], screenCapture, playing, time)
        //     // timing(regerg[regerg.length - 1], screenCapture, playing, time)
        }
        // let ppp;
        // collection
        
        setTimeout(() => {
            console.log('active', active.value)
            console.log('find', find(active.value.link))
            console.log('collection', collection)
            let ppp = computed(() => find(active.value.link))
            timing(ppp, screenCapture, playing, time)
            let t = generalTime - active.value.time.start;
            console.log(t)
            ppp.value.currentTime = t / 1000
        }, 1000)
        // setTimeout(() =>  {
        //     ppp = arr.get(availableScreens.value[0].link)
        //     console.log('ppp', ppp)
        //     console.log('active', active)
        // }, 1000);
        // console.log('arr', arr)
        // console.log('availableScreens.value[0].link', availableScreens.value[0].link)
        
        // }, 1000)
    }

    return {
        play,
        pause,
        stop,
        seek,
        waiting
    }
}

// export {promiseList}