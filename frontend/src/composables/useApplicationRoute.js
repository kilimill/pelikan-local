import {useRouter} from "vue-router";
import useApplicationMode from "@/composables/useApplicationMode";

export default function useApplicationRoute() {
    const router = useRouter()
    const {isActivity, isPlayback} = useApplicationMode()

    const toRoom = () => router.replace({name: 'Room'})
    const toPlayback = () => router.replace({name: 'Playback'})
    const toEcho = () => router.replace({name: "EchoTest"})
    const toEntry = () => router.replace({name: "Entry"})

    const resolve = () => {
        return isActivity() ? toRoom() : isPlayback() ? toPlayback() : toEntry()
    }

    return {
        toEntry,
        toRoom,
        toPlayback,
        toEcho,
        resolve,
    }
}