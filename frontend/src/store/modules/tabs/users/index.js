export const SORT_ORDER_NAME = "name"
export const SORT_ORDER_HAND = "hand"
const AVAILABLE_SORT_ORDERS = [SORT_ORDER_HAND, SORT_ORDER_NAME]

export default {
    namespaced: true,
    state: () => ({
        sortOrder: SORT_ORDER_NAME,
    }),
    mutations: {
        sortOrder(state, order) {
            state.sortOrder = AVAILABLE_SORT_ORDERS.includes(order) ? order : state.sortOrder
        },
    },
}
