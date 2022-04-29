import InvalidTypeError from "@/services/playback/exception/InvalidTypeError";

export default class TimeCorrector {
    /** @type {Number} Первый ключ */
    #timeStart

    /** @type {Number[]} Время простоя для корректировки */
    #idleTimes

    constructor() {
        this.reset()
    }

    reset() {
        this.#idleTimes = []
    }

    get timeStart() {
        return this.#timeStart
    }

    set timeStart(value) {
        this.#timeStart = this.#timeStart || value
    }

    /**
     *
     * @param {number} value
     */
    set idleTime(value) {
        if (Number.isInteger(value)) {
            this.#idleTimes.push(value)
        } else throw new InvalidTypeError(`Invalid type ${typeof value}; Integer expected`)
    }

    /**
     *
     * @return {number}
     */
    get idleTime() {
        return Math.abs(this.#idleTimes.reduce((previousValue, currentValue) => {
            return previousValue - currentValue
        }, 0))
    }

    /**
     * TODO: хз пока зачем
     * @return {number}
     */
    get correctTime() {
        if (this.#timeStart && this.#idleTimes.length) {
            return this.#timeStart + this.idleTime
        }

        return 0
    }
}