import playbackService from "@/services/playback";
import playbackApi from "@/api/playback";
//import {toRaw} from "vue";
import camelCase from "camelcase";
import IdleMiddleware from "@/services/playback/middleware/IdleMiddleware";
import SkipMiddleware from "@/services/playback/middleware/SkipMiddleware";
import {
    EVENT_CANPLAY,
    EVENT_FINISHED,
    EVENT_STARTED,
    EVENT_WAITING
} from "@/services/playback/PlaybackService";
import {cloneDeep} from "lodash";

const playbackPlugin = store => {
    const stateCasts = [];

    const replaceState = cast => {
        console.log(cast)
        store.replaceState(cloneDeep(cast))
    }

    playbackService.addEventListener(EVENT_STARTED, () => {
        playbackService.dispatchEvent(EVENT_WAITING)
        stateCasts.push(cloneDeep(store.state))
        playbackService.dispatchEvent(EVENT_CANPLAY)
    })

    playbackService.addEventListener(EVENT_FINISHED, () => {
        playbackService.dispatchEvent(EVENT_WAITING)
        replaceState(stateCasts[0])
        playbackService.dispatchEvent(EVENT_CANPLAY)
    })

    playbackService.addEventListener('message', event => {
        const rootEventAction = camelCase(`event.${event.name}`)

        if (Object.prototype.hasOwnProperty.call(store['_actions'], rootEventAction)) {
            store.dispatch(rootEventAction, {
                meta: event.meta,
                name: event.name,
                data: event.message,
            }, {root: true}).catch(reason => console.error(reason))
        }
    })

    /**
     * @param {{currentRoom:{}, playbackStore: {dbName:string, storeName:string}}} config
     * @return {Promise<*>}
     */
    store.initPlaybackPlugin = config => {
        const syncMethod = () => playbackApi.getNextPartition()
        config.playbackStore.dbName += config.currentRoom.id;

        playbackService.middleware.accept(new IdleMiddleware())
        playbackService.middleware.accept(new SkipMiddleware())
        return playbackService.configure({...config.playbackStore, syncMethod})
    }
}

export default playbackPlugin