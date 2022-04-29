import components from "@/store/modules/tabs/components";
import chat from "./chat"
import users from "./users"

/**
 * @typedef {{
 * visible: Boolean,
 * name: String,
 * icon: String,
 * options: Object,
 * highlight: Boolean
 * }} InternalComponentSnippet
 * @type {InternalComponentSnippet[]}
 */
const currentComponentList = Object.values(components).map(component => ({
    name: component.name,
    icon: component.icon,
    visible: component.visibility,
    options: component.options || {},
    highlight: false,
}))

const defaultComponentName = currentComponentList.find(i => i.visible).name

export default {
    namespaced: true,
    modules: {chat, users},
    state: () => ({
        /** @type {InternalComponentSnippet[]} */
        componentList: currentComponentList,
        /** @type {String} */
        componentName: defaultComponentName,
    }),
    mutations: {
        /**
         * @param state
         * @param {String} componentName
         */
        currentComponent(state, componentName) {
            if (Object.keys(components).includes(componentName)) {
                state.componentName = componentName
            }
        },
        highlightComponent(state, {name, highlight = false}) {
            state.componentList.find(component => component.name === name).highlight = highlight
        },
        toDefaultComponent(state) {
            state.componentName = defaultComponentName
        }
    },
    getters: {
        /**
         * @param state
         * @param getters
         * @return {InternalComponentSnippet|undefined}
         */
        currentComponent(state, getters) {
            return getters["findComponent"](state.componentName)
        },
        findComponent(state) {
            return componentName => state.componentList.find(i => i.name === componentName)
        }
    },
}