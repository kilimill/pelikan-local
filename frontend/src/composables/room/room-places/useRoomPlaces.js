import MainPanel from "@/components/room/main-panel"
import RoomVideo from "@/components/room/RoomVideo";
import PlaybackVideo from "@/components/playback/PlaybackVideo";
import EmptyVideo from "@/components/common/EmptyVideo";
import {computed, provide} from "vue";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useApplicationMode from "@/composables/useApplicationMode";
import roomVideo from "@/components/room/RoomVideo";
import playbackVideo from "@/components/playback/PlaybackVideo";

export const components = {MainPanel, RoomVideo, PlaybackVideo, EmptyVideo}

export default function useRoomPlaces() {
    const {changeSetting, mutateSetting, settingsNames, roomSettings} = useRoomSettings()
    const {isPlayback, isActivity} = useApplicationMode()
    const {isHost} = useCurrentUser()
    const componentSwitcher = computed(() => Number(roomSettings.value.enabledVPDF))
    const videoComponent = computed(() => isActivity() ? roomVideo : isPlayback() ? playbackVideo : EmptyVideo)

    const roomPlaces = computed(() => [
        {large: videoComponent.value, small: components.MainPanel},
        {large: components.MainPanel, small: videoComponent.value},
    ][componentSwitcher.value])

    const softSwitchPlaces = () => mutateSetting(settingsNames.ROOM_CURRENT_V_PDF, !roomSettings.value.enabledVPDF)
    const hardSwitchPlaces = () => changeSetting(settingsNames.ROOM_CURRENT_V_PDF, !roomSettings.value.enabledVPDF)
    const switchPlaces = () => isHost.value ? hardSwitchPlaces() : softSwitchPlaces()

    provide('switchPlaces', switchPlaces)

    return {roomPlaces, switchPlaces}
}