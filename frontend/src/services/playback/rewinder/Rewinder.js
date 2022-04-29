/*eslint no-unused-vars: "off"*/
import EventEmitter from "@/abstract/EventEmitter";
import RewinderError from "@/services/playback/exception/RewinderError";

export const EVENT_REWIND = "rewind"
export const EVENT_MESSAGE = "message"
export const EVENT_START   = "start-processing"
export const EVENT_STOP    = "stop-processing"
export const EVENT_ERROR   = "error"
export const EVENT_WAIT    = "wait"
export const EVENT_READY   = "ready"
export const EVENT_SEEK    = "seek"

/** @type {string[]} */
export const AVAILABLE_EVENTS = [
    EVENT_START,
    EVENT_STOP,
    EVENT_MESSAGE,
    EVENT_REWIND,
    EVENT_ERROR,
    EVENT_WAIT,
    EVENT_READY,
]

/**
 *
 * @abstract
 */
export default class Rewinder extends EventEmitter {
    /** @type {RewindManager} */
    #rewindManager

    /** @type {object|undefined} */
    #options

    /**
     *
     * @param {RewindManager} manager
     * @param {object} [options]
     */
    constructor(manager, options= undefined) {
        super();
        this.#rewindManager = manager
        this.#options = options ?? undefined
    }

    /**
     * @abstract
     * @param {object} options
     * @return {boolean}
     */
    checkOptions(options) {
        return false
    }

    /** @return {Object|undefined} */
    get options() {
        return this.#options
    }

    /**
     *
     * @param {object} options
     * @return {boolean|self}
     */
    apply(options) {
        if (this.checkOptions(options)) {
            return new this.constructor(this.#rewindManager, options)
        }
        return false
    }

    addEventListener(event, listener) {
        if (AVAILABLE_EVENTS.includes(event)) {
            super.addEventListener(event, listener)
        } else throw new RewinderError(`Unavailable event '${event}`)
    }

    /**
     *
     * @return
     */
    get manager() {
        return this.#rewindManager
    }

    /**
     * @abstract
     * @param {Function} receiver
     * @return {Promise}
     */
    handleRequest(receiver) {
        throw new Error('You have to implement the method handleRequest!');
    }
}