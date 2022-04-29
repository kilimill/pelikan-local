import {useStore} from "vuex";
import {computed, watch, onMounted} from "vue";

export default function usePlaybackWatchers(){

  const store = useStore()

  const playerMain = computed(() => store.getters["media/playerMain"]);
  const activeRangeHost = computed(() => store.getters["playback/ranges/activeRangeHost"]);
  const activeRangeCalled = computed(() => store.getters["playback/ranges/activeRangeCalled"]);
  const activeRangeScreen = computed(() => store.getters["playback/ranges/activeRangeScreen"]);
  const activeMountPointId = computed(() => store.getters["playback/mountpoints/activeId"]);
  const currentValue = computed(() => store.getters["playback/timeline/currentValue"]);
  const files = computed(() => store.getters["playback/files/files"]);

  onMounted(() => {
    checkActiveMountPoint(currentValue.value)
  })

  const activeRangeHandler = (newRange, oldVal) => {
    if(newRange === undefined){
      let type = store.getters["playback/mountpoints/typeById"](oldVal.mountpointId)
      store.dispatch("playback/files/unsetActiveFile", {type});
    }
  }

  const checkFile = (range, timeValue) => {
    let file = files.value.find(f => f.mediaRangeId === range.id);
    let type = store.getters["playback/mountpoints/typeById"](range.mountpointId)
    if(file.timeStart <= timeValue){
      store.dispatch("playback/files/setActiveFile", {type: type, fileId: file.id})
    }
  }

  const checkActiveMountPoint = (timeValue) => {
      let id = store.getters["playback/messages/lastSelectedMountPointId"](timeValue);

      store.dispatch("playback/mountpoints/setActiveMountPoint", {id});
  }

  const checkRanges = (timeValue) => {
      let activeRanges = store.getters["playback/ranges/activeRangesAll"](timeValue)
      let typesActive = [];
      let activeMountPointType = store.getters["playback/mountpoints/typeById"](activeMountPointId.value)

    for (const range of activeRanges) {
      let type = store.getters["playback/mountpoints/typeById"](range.mountpointId)

      if(
        type === "host" &&
        activeMountPointType === "host" &&
        range.mountpointId !== activeMountPointId.value
      ){
        continue;
      }
      if(
        type === "host" &&
        activeMountPointType === "called" &&
        typesActive.indexOf("host") !== -1
      ){
        continue;
      }

      store.dispatch("playback/ranges/activeRange", {
        currentTime: timeValue,
        mountPointId: range.mountpointId,
        type: type
      }).then(activeRange => {
        checkFile(activeRange, timeValue);
      });

      if(typesActive.indexOf(type) === -1){
        typesActive.push(type);
      }
    }
    if(typesActive.length > 0){
      store.dispatch("playback/ranges/unsetRanges", {typesActive});
    }
  }

  watch(activeMountPointId, (newVal) => {
    if(newVal.value !== undefined){
      let type = store.getters["playback/mountpoints/typeById"](newVal.value)

      store.dispatch("playback/ranges/activeRange", {
        currentTime: currentValue.value,
        mountPointId: newVal.value,
        type: type
      });
    }
  });

  watch(activeRangeScreen, activeRangeHandler);
  watch(activeRangeCalled, activeRangeHandler);
  watch(activeRangeHost, activeRangeHandler);

  watch(playerMain, (newVal) => {
    if(newVal !== undefined){
      let type = store.getters["playback/mountpoints/typeById"](activeMountPointId.value)

      store.dispatch("playback/ranges/activeRange", {
        currentTime: currentValue.value,
        mountPointId: activeMountPointId.value,
        type: type
      });
    }
  });

  watch(currentValue, () => {
    checkActiveMountPoint(currentValue.value)
    checkRanges(currentValue.value)
  });

  return {

  }
}