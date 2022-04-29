/**
 * Этот плагин выполнит все initModule root actions
 *
 * @type {import("vuex/types").Plugin}
 * @param {import("vuex/types").Store} store
 */
const initModulePlugin = store => {
    store.initModules = payload => {
        return store.dispatch("initModule", payload, {root: true})
    }
}

export default initModulePlugin;