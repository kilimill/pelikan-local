/**
 *
 * @param {Date} targetTime
 * @return {{}}
 */
import {computed, reactive, ref} from "vue";
import useIntervalSingleton from "@/composables/useIntervalSingleton";

export default function useCountdownTimer(targetTime) {
    const timer = reactive({hours: 0, minutes: 0, seconds: 0})

    const {setInterval, clearInterval} = useIntervalSingleton(clear => {
        clear ? clearInterval() : undefined
    }, ref(Math.floor(targetTime - (new Date()) / 1000)))

    setInterval((checkInterval, interval) => {
        checkInterval(--interval.value < 1)
        timer.seconds = Math.floor(interval.value % 60)
        timer.minutes = Math.floor(interval.value / 60 % 60)
        timer.hours = Math.floor(interval.value / 3600 % 24)
    }, 1000, true)

    return {
        timer: computed(() => ({
            hours: `0${timer.hours}`.slice(-2),
            minutes: `0${timer.minutes}`.slice(-2),
            seconds: `0${timer.seconds}`.slice(-2),
        })),
        clearInterval: () => {
            clearInterval()
            timer.hours = 0
            timer.minutes = 0
            timer.seconds = 0
        }
    }
}