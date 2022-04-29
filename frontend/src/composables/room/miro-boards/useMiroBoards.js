import {useStore} from "vuex";
import {computed, reactive, ref} from "vue";

/**
 * @type {{enabled: boolean|undefined}}
 */
const filterDefaults = {
    enabled: undefined,
}

/**
 * @param {filterDefaults|{}} filter
 */
export default function useMiroBoards(filter = {}) {
    const store = useStore()
    const boardsFilter = reactive({...filterDefaults, ...filter})
    const boardsList = computed(() => store.state.room.boards.list)

    const filteredList = computed(() => boardsList.value.filter(i => {
        return boardsFilter.enabled === undefined || (i.enabled) === boardsFilter.enabled
    }))

    const hasFilteredResults = computed(() => Boolean(filteredList.value.length))
    const findBoard = id => boardsList.value.find(i => i.id === id)
    const deleteBoard = board => store.dispatch("room/boards/delete", board.id)
    const deleteItem = ref()

    const toggleVisibility = item => {
        return store.dispatch("room/boards/update", {id: item.id, status: item.statusId === 3 ? 2: 3})
    };

    return {
        boardsList,
        boardsFilter,
        filteredList,
        hasFilteredResults,
        deleteItem,
        deleteBoard,
        findBoard,
        toggleVisibility
    }
}