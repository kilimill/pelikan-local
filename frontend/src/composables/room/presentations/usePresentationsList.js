import {computed, reactive} from "vue";
import {useStore} from "vuex";

/**
 * @type {{default: boolean|undefined, enabled: boolean|undefined}}
 */
const filterDefaults = {
    default: false,
    enabled: undefined,
}

/**
 * filters:
 *  true - только с положительным свойством
 *  false - только с отрицательным
 *  undefined - любые
 * @param {filterDefaults|{}} filter
 */
export default function usePresentationsList(filter = {}) {
    const store = useStore()
    const presentationsFilter = reactive({...filterDefaults, ...filter})
    const findPresentation = (id) => store.state.room.presentations.list.find(i => i.id === id)
    const hasPresentations = computed(() => Boolean(store.getters["room/presentations/presentationsList"].length))
    const presentationsList = computed(() => [
        store.getters["room/presentations/defaultPresentation"],
        ...store.getters["room/presentations/presentationsList"],
    ].filter(Boolean))

    const filteredPresentations = computed(() => {
        return presentationsList.value.filter(i =>
            (presentationsFilter.enabled === undefined || Boolean(i.activity) === presentationsFilter.enabled) &&
            (presentationsFilter.default === undefined || Boolean(i.default) === presentationsFilter.default)
        )
    })

    const hasFilteredResults = computed(() => Boolean(filteredPresentations.value.length))

    return {
        hasPresentations,
        presentationsList,
        filteredPresentations,
        presentationsFilter,
        hasFilteredResults,
        findPresentation,
    }
}