import {useStore} from "vuex";
import {computed} from "vue";

export default function useApplicationLogout() {
    const store = useStore()
    const link  = computed(() => store.getters['application/logoutLink'])
    const logout = () => window.location.href = link.value;

    return {logout, logoutLink: link}
}