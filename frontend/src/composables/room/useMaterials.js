import {computed, reactive} from "vue";
import {useStore} from "vuex";

/**
 * @type {{enabled: boolean|undefined}}
 */
const filterDefaults = {
    enabled: undefined,
}

/**
 * @param {filterDefaults|{}} filter
 */
export default function useMaterials(filter = {}) {
    const store = useStore()
    const materialsList = computed(() => store.state.room.materials.list)
    const materialsFilter = reactive({...filterDefaults, ...filter})
    const filteredMaterials = computed(() => materialsList.value.filter(i =>
        (materialsFilter.enabled === undefined || materialsFilter.enabled === Boolean(i.active))
        // && (filter condition)
    ))

    const hasFilteredResults  = computed(() => Boolean(filteredMaterials.value.length))

    return {
        materialsList,
        filteredMaterials,
        materialsFilter,
        hasFilteredResults,
    }
}