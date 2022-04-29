<template>
  <div class="room row">
    <preloader v-if="loading" />
    <echo-test v-else-if="echoTestRequired" />
    <template v-else>
      <section class="a-side col bg-light text-dark">
        <div class="place-holder--large">
          <component v-if="showPlaces" :is="roomPlaces.large" data-placement="large" placement="large"/>
        </div>
      </section>
      <section class="b-side">
        <div class="controls-holder"><room-controls/></div>
        <div class="place-holder place-holder--small">
          <component v-if="showPlaces" :is="roomPlaces.small" data-placement="small" placement="small"/>
        </div>
        <div class="tabs-holder"><tab-components/></div>
      </section>
      <media />
      <sound-alert />
      <modal-windows />
    </template>
  </div>
</template>

<script>
import RoomControls from "@/components/room/RoomControls";
import Media from "@/components/room/Media";
import SoundAlert from "@/components/room/SoundAlert";
import ModalWindows from "@/components/room/ModalWindows";
import TabComponents from "@/components/room/TabComponents";
import Preloader from "@/components/common/Preloader";
import useViewportMatcher from "@/composables/useViewportMatcher";
import useApplicationError from "@/composables/useApplicationError";
import useRoomInitialization from "@/composables/room/useRoomInitialization";
import useRoomPlaces, {components} from "@/composables/room/room-places/useRoomPlaces"
import useEchoTester from "@/composables/room/useEchoTester";
import EchoTest from "@/views/EchoTest";

export default {
  name: "Room",
  components: {EchoTest, Preloader, TabComponents, RoomControls, Media, SoundAlert, ModalWindows, ...components},

  setup() {
    const {initRoom, loading} = useRoomInitialization()
    const applicationError = useApplicationError()
    const {matchViewport:showPlaces} = useViewportMatcher('(min-width: 992px)')
    const {echoTestRequired, require:requireEchoTest} = useEchoTester()
    const {roomPlaces} = useRoomPlaces()

    initRoom()
        .then(requireEchoTest)
        .catch(applicationError.setError)

    return {loading, showPlaces, roomPlaces, echoTestRequired}
  },
}
</script>

<style scoped lang="scss">

</style>