import {useStore} from "vuex";
import {computed} from "vue";

export default function useMainPanelContent() {
    const store = useStore()
    const availableContentValues = computed(() => store.getters["room/content/availableContentValues"])
    const availableSelectedValue = computed(() => store.getters["room/content/availableSelectedValue"]) // Computed
    const currentSelectedContent = computed(() => store.getters['room/content/selectedContentValue']) // selected
    const previousSelectedValue = computed(() => store.state.room.content.previousValue)

    const selectedContentValue = computed({
        get: () => String(currentSelectedContent.value || availableSelectedValue.value),
        set: vl => store.commit('room/content/selectedContentValue', vl)
    })

    return {
        selectedContentValue,
        availableContentValues,
        previousSelectedValue,
    }
}