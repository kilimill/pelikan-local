export default function useIntervalSingleton() {
    let interval, fn = (callback, period, immediate = false) => {
        interval = interval ? clearInterval(interval) : undefined
        interval = setInterval(callback, parseInt(period), ...arguments)
        immediate ? callback(...arguments) : undefined
    }

    return {setInterval: fn, clearInterval: () => clearInterval(interval)}
}