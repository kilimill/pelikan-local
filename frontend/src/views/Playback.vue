<template>
  <preloader v-if="loading"/>
  <div class="playback row" v-else>
    <section class="a-side col bg-light text-dark">
      <div class="place-holder--large">
        <component v-if="showPlaces" :is="roomPlaces.large" data-placement="large" placement="large"/>
      </div>
    </section>
    <section class="b-side">
      <div class="controls-holder"><playback-controls/></div>
      <div class="place-holder place-holder--small">
        <component v-if="showPlaces" :is="roomPlaces.small" data-placement="small" placement="small"/>
      </div>
      <div class="tabs-holder"><tab-components/></div>
    </section>
  </div>
</template>

<script>
import Preloader from "@/components/common/Preloader";
import useRoomPlaces, {components} from "@/composables/room/room-places/useRoomPlaces"
import useApplicationError from "@/composables/useApplicationError";
import usePlaybackInitialization from "@/composables/playback/usePlaybackInitialization";
import useViewportMatcher from "@/composables/useViewportMatcher";
import PlaybackControls from "@/components/playback/PlaybackControls";
import TabComponents from "@/components/room/TabComponents";

export default {
  name: "Playback",
  components: {TabComponents, PlaybackControls, Preloader, ...components},
  setup() {
    const {initPlayback, loading} = usePlaybackInitialization()
    const applicationError = useApplicationError()
    const {matchViewport:showPlaces} = useViewportMatcher('(min-width: 992px)')
    const {roomPlaces} = useRoomPlaces()

    initPlayback().then(() => {
      //playbackService.run()
    }).catch(applicationError.setError);

    return {
      loading,
      showPlaces,
      roomPlaces,
    }
  }
}
</script>

<style scoped lang="scss">
  .controls-holder { padding-bottom: 0; }
  .place-holder { padding-top: 0; }
</style>