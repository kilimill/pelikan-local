import {computed} from "vue";
import {useStore} from "vuex";

export default function useEchoTester() {
    const store = useStore()
    const echoTestFinished = computed(() => store.state.echoTest.status.finished)
    const echoTestAccepted = computed(() => store.state.echoTest.accepted)
    const echoTestRequired = computed(() => !(echoTestFinished.value && echoTestAccepted.value))

    return {
        echoTestFinished,
        echoTestRequired,
        require: () => store.commit("echoTest/userAccepted", false)
    }
}