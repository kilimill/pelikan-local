import mitt from "mitt";

/**
 * @abstract class
 */
export default class EventEmitter {
    #emitter

    constructor() {
        this.#emitter = mitt()
    }

    /**
     *
     * @param {string} event
     * @param {object} [params]
     * @return {void}
     */
    dispatchEvent(event, params) {
        this.#emitter.emit(event, params)
    }

    /**
     *
     * @param {string} event
     * @param {function} listener
     * @return {void}
     */
    addEventListener(event, listener) {
        this.#emitter.on(event, listener)
    }

    /**
     *
     * @param {string} event
     * @param {function} listener
     */
    removeEventListener(event, listener) {
        this.#emitter.off(event, listener)
    }
}