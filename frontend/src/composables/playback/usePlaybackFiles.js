import {computed, reactive} from "vue";
import {useStore} from "vuex";

const filterDefaults = {
  enabled: undefined,
}

export default function usePlaybackFiles(filter = {}){
  const store = useStore()

  const filesList = computed(() => store.state.playback.files.list)
  const filesFilter = reactive({...filterDefaults, ...filter})

  const filteredFiles = computed(() => filesList.value?.filter(i =>
      (filesFilter.enabled === undefined || filesFilter.enabled === Boolean(i.active))
  ))
  const hasFilteredResults  = computed(() => Boolean(filteredFiles.value?.length))

  return {
    filesList,
    filteredFiles,
    filesFilter,
    hasFilteredResults
  }
}