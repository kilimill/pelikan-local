<template>
  <teleport v-for="pair of placesPairs" :key="pair['name']"  :to="`#room-place-${pair['place']}`">
    <component :is="pair['name']" :data-placement="pair['place']" :placement="pair['place']"/>
  </teleport>
</template>

<script>
import {provide, watch} from "vue";
import MainPanel from "@/components/room/main-panel";
import RoomVideo from "@/components/room/RoomVideo";
import useRoomSettings from "@/composables/room/useRoomSettings";
import useCurrentUser from "@/composables/users/useCurrentUser";
import useRoomPlaces from "@/composables/room/useRoomPlaces";

export default {
  name: "RoomPlaces",
  components: {RoomVideo, MainPanel},
  setup() {
    const {changeSetting, mutateSetting, settingsNames, roomSettings} = useRoomSettings()
    const {currentUser} = useCurrentUser()
    const {placesPairs, placesSwitch} = useRoomPlaces([RoomVideo.name, MainPanel.name])

    const softSwitchPlaces = () => mutateSetting(settingsNames.ROOM_CURRENT_V_PDF, !roomSettings.value.enabledVPDF)
    const hardSwitchPlaces = () => changeSetting(settingsNames.ROOM_CURRENT_V_PDF, !roomSettings.value.enabledVPDF)
    const switchPlaces = () => currentUser.value.isHost ? hardSwitchPlaces() : softSwitchPlaces()

    provide('switchPlaces', switchPlaces)

    watch(() => roomSettings.value.enabledVPDF, value => placesSwitch.value = Number(value), {immediate: true})

    return {
      switchPlaces,
      placesPairs,
      placesSwitch,
    }
  }
}
</script>

<style scoped>

</style>