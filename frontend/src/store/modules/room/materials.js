import MaterialsReducer from "@/api/application/reducers/MaterialsReducer";

export default {
    namespaced: true,
    state: () => ({
        list: [],
    }),
    actions: {
        initModule: {
            root: true,
            handler: (context, {materials}) => context.commit('hydrate', materials)
        },
        eventRoomMaterialUpdate: {
            root: true,
            handler: (context, {data:{new: materials}}) => {
                context.commit("add", materials.map(MaterialsReducer.reduceMaterial))
            }
        },
        eventRoomMaterialToggle: {
            root: true,
            handler: (context, {data: {id, activity: active}}) => {
                const item = context.state.list.find(i => i.id === id)
                context.commit("update", {...item, active})
            }
        },
        eventRoomMaterialDelete: {
            root: true,
            handler: (context, {data: {deletedId:id}}) => context.commit("delete", id)
        }
    },
    mutations: {
        hydrate(state, payload) {
            state.list = Object.values(payload || {});
        },
        list: (state, materials) => state.list = materials,
        add: (state, materials) => state.list = [...state.list, ...materials],
        update: (state, item) => state.list = [...state.list.filter(i => i.id !== item.id), item],
        delete: (state, id) => state.list = state.list.filter(i => i.id !== id)
    }
}