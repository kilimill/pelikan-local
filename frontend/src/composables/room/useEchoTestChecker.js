import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {computed} from "vue";

export default function useEchoTestChecker() {
    const router = useRouter()
    const store = useStore()
    const successful = computed(() => store.state.echoTest.results.finished)

    return {
        successful, handle: () => {
            if (!successful.value) {
                router.replace({name: 'EchoTest'}).catch(reason => console.error(reason))
            }
        }
    }
}