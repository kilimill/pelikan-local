import {onUnmounted} from "vue";

export default function useTimeoutSingleton() {
    let timeout, fn = (callback, interval) => {
        timeout = timeout ? clearTimeout(timeout) : timeout
        timeout = setTimeout(callback, parseInt(interval))
    }

    onUnmounted(() => timeout ? clearTimeout(timeout) : undefined)

    return {setTimeout: fn, clearTimeout: () => clearTimeout(timeout)}
}