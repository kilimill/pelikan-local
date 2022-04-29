import Rewinder from "@/services/playback/rewinder/Rewinder";

const IDLE_START = "start"
const IDLE_PAUSE = "pause"

export default class IdleRewinder extends Rewinder {

    checkOptions(options) {
        if ("idle" in options) {
            options.type = this.idleType(options['idle'])
            return true
        }

        return false
    }

    /**
     * @param {Number} idle
     * @return {string}
     */
    idleType(idle) {
        return idle === 0 ? IDLE_START : IDLE_PAUSE
    }

    handleRequest(receiver) {
        return new Promise((resolve, reject) => this.process(receiver, resolve, reject))
    }

    /**
     * @param {Function} receiver
     * @param {Function} resolve
     * @param {Function} reject
     */
    process(receiver, resolve, reject) {
        const {idle, type} = this.options
        let request = this.manager.cursor(idle ? IDBKeyRange.lowerBound(idle, true) : undefined),
            firstMessage = undefined

        request.addEventListener('success', () => {
            let cursor = request.result,
                value  = cursor?.value,
                isStart = type === IDLE_START && value && this.isStartEvent(value),
                isResume = type === IDLE_PAUSE && value && this.isResumeEvent(value),
                isLast = isStart || isResume

            if (value) {
                firstMessage = firstMessage || value
                this.#processEvent(value, firstMessage, isLast)
                receiver(value)
                isLast ? resolve(value.time_created) : cursor.continue()
            }
        })

        request.addEventListener("error", event => reject(event))
    }

    /**
     *
     * @param {{time_created, data: {name:string, message:object}}} event
     * @param {{time_created, data: {name:string, message:object}}} first
     * @param {boolean} isLast
     */
    #processEvent(event, first, isLast) {
        if (event === first) {
            this.manager.idleTime.timeStart = event.time_created
        } else if (isLast) {
            this.manager.idleTime.idleTime = first.time_created - event.time_created
        }
    }

    /**
     * @return boolean
     */
    isStartEvent({data: {name}}) {
        return name === 'event.start'
    }

    isResumeEvent({data: {name}}) {
        return name === 'event.resume'
    }
}