let activityMethod,
    activityTimeout

export default function activity(interval, attempts, promise) {
    if (interval && attempts && promise) {
        activityMethod = null;
        clearTimeout(activityTimeout)

        activityMethod = (() => {
            activityTimeout = activityTimeoutFunc(interval, attempts, promise)
        })
        activityMethod()
    }
}

const activityTimeoutFunc = (interval, attempts, promise) => {
    return setTimeout(() => {
        promise().then(activityMethod).catch(reason => {
            if (attempts-- > 0) {
                activityTimeoutFunc(interval, attempts, promise)
            } else {
                console.error(reason)
                activityTimeoutFunc(interval, attempts, promise)
            }
        })
    }, interval)
}
