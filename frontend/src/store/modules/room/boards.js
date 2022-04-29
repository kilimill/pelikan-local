import miroBoardsApi from "@/api/miroBoards";

/**
 * @type {import("vuex/types").Module}
 */
const boardsModule = {
    namespaced: true,
    state: () => ({
        list: [],
        active: undefined
    }),
    actions: {
        initModule: {
            root: true,
            handler: async (context, {boards = [], currentRoom: {activeBoard}}) => {
                if (boards.length === 0) {
                    miroBoardsApi.list().then(response => {
                        context.commit("list", response.data.items)
                    }).catch(reason => console.log(reason))
                } else {
                    context.commit("list", boards)
                }

                context.commit("active", activeBoard?.id)
            }
        },
        eventRoomBoardCreate: {
            root: true,
            handler: (context, {data: {board}}) => {
                board ? context.commit("add", board) : Error('Invalid board')
            }
        },
        eventRoomBoardDelete: {
            root: true,
            handler: (context, {data: {board}}) => context.dispatch("unlink", board.id),
        },
        eventRoomBoardUpdate: {
            root: true,
            handler: (context, {data: {board}}) => context.commit("update", board)
        },
        eventRoomBoardSelect: {
            root: true,
            handler: (context, {data: {board}}) => context.commit("active", board.id)
        },

        unlink: (context, id) => context.commit("list", context.state.list.filter(i => i.id !== id)),
        delete: (context, id) => miroBoardsApi.delete(id),
        update: (context, item) => miroBoardsApi.update(item)
    },
    mutations: {
        list: (state, list) => state.list = list,
        active: (state, id) => state.active = id,
        add: (state, board) => state.list.push(board),
        update: (state, board) => {
            state.list = [...state.list.filter(i => i.id !== board.id), board]
        }
    },
    getters: {
        activeBoard: state => state.list.find(i => i.id === state.active && i.statusId < 3),
    }
}

export default boardsModule;