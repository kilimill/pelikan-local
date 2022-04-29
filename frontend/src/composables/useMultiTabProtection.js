import Cookies from "js-cookie";
import {onBeforeUnmount} from "vue";

const currentTimestamp = () => Math.floor(Date.now() / 1000)

export default function useMultiTabProtection(
    cookieName = 'tabCookie',
    cookiePath = '/',
    latency = 10
) {
    const hasCookie = () => Boolean(Cookies.get(cookieName))
    const getCookie = () => hasCookie() ? Number(Cookies.get(cookieName)) : undefined
    const setCookie = timestamp => Cookies.set(cookieName, timestamp, {path: cookiePath})
    const removeCookie = () => Cookies.remove(cookieName, {path: cookiePath})
    const initial = hasCookie() ? getCookie() + latency : undefined

    const interval = setInterval(() => {
        setCookie(currentTimestamp())
    }, 1000)

    const shutdown = () => {
        clearInterval(interval)
        removeCookie()
    }

    window.addEventListener('beforeunload', shutdown)
    onBeforeUnmount(shutdown)

    return {
        check: (timestamp = currentTimestamp()) => {
            return initial && initial > timestamp
        },
    }
}