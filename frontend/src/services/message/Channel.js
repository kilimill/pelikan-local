import mitt from "mitt";

export default class Channel {
    /** @type {String} */
    #name

    /** @type {import("mitt").Emitter} */
    #mitt

    /**
     * @param {String} name
     */
    constructor(name) {
        this.#name = name
        this.#mitt = mitt()
    }

    /**
     * @return {string}
     */
    get name() {
        return this.#name
    }

    /**
     * @param {string} event
     * @param {function(event):void }handler
     * @return {Channel}
     */
    on(event, handler) {
        this.#mitt.on(event, handler)
        return this
    }

    /**
     * @param {string} event
     * @param {function(event):void }handler
     */
    off(event, handler) {
        this.#mitt.off(event, handler)
    }

    /**
     * @param {string} event
     * @param {*} payload
     */
    emit(event, payload) {
        this.#mitt.emit(event, payload)
    }
}