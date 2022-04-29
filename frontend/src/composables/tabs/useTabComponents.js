import {computed, watch} from "vue";
import {useStore} from "vuex";

export default function useTabComponents() {
    const store = useStore()

    watch([
        () => store.getters["room/users/handRaised"],
        () => store.state.room.users.highlight
    ], ([raised, highlighted]) => store.commit("tabs/highlightComponent", {
        name: "TabUsers",
        highlight: Boolean(raised.length && store.getters['user/isHost'] || highlighted.length)
    }), {deep: true})

    return {
        componentsList: computed(() => store.state.tabs.componentList),
        currentComponent: computed({
            get: () => store.getters["tabs/currentComponent"],
            set: vl => store.commit('tabs/currentComponent', vl)
        }),
        toDefaultTab: () => store.commit('tabs/toDefaultComponent')
    }
}