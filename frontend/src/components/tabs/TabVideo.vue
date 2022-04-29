<template>
  <div class="tab-content">
    <room-video placement="tab" v-if="mode.isActivity" />
    <playback-video placement="tab" v-if="mode.isPlayback" />
  </div>
</template>

<script>

// TODO: реализовать
import RoomVideo from "@/components/room/RoomVideo";
import useApplicationMode from "@/composables/useApplicationMode";
import PlaybackVideo from "@/components/playback/PlaybackVideo";
import {reactive} from "vue";
export default {
  name: "TabVideo",
  components: {PlaybackVideo, RoomVideo},
  icon: "video_camera_front",
  visibility: false,
  setup() {
    const {isActivity, isPlayback} = useApplicationMode()
    const mode = reactive({isActivity: isActivity(), isPlayback: isPlayback()})

    return {mode}
  }
}
</script>

<style scoped lang="scss">

</style>