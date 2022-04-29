import {useStore} from "vuex";
import miroBoardsApi from "@/api/miroBoards";
import {computed} from "vue";

export default function useActiveMiroBoard() {
    const store = useStore()
    const currentBoard = computed(() => store.getters["room/boards/activeBoard"])
    const selectBoard = id => miroBoardsApi.select(id)

    return {currentBoard, selectBoard}
}