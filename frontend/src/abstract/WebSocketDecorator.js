/*eslint no-dupe-class-members: "off"*/
import createEmitter from "mitt";
var Centrifuge = require('centrifuge')
export const WS_EVENT_SUBSCRIBE = 'subscribe'
export const WS_EVENT_CONNECT = 'connect'
export const WS_EVENT_UNSUBSCRIBE = 'unsubscribe'
export const WS_EVENT_PUBLISH = 'publish'
export const WS_EVENT_ERROR = 'error'
export let centrifuge = ''
export const WS_EVENTS = [WS_EVENT_SUBSCRIBE, WS_EVENT_PUBLISH, WS_EVENT_CONNECT, WS_EVENT_UNSUBSCRIBE, WS_EVENT_ERROR]

/**
 * @typedef {import('mitt').Emitter} Emitter
 */
export class WebSocketDecorator {
    /** @type Emitter */
    #emitter;

    /** @type WebSocket */
    #instance;

    /** @type {{url:string, protocols:[], canal:string}} */
    #configuration;

    /** @type {{}} */
    #handlers

    /** @type {function} */
    #eventListener

    /**
     *
     * @param {string} url
     * @param {string[]} [protocols]
     */
    constructor(url, protocols = undefined, userToken) {
        this.#configuration = {url, protocols, userToken}
        this.#emitter = createEmitter()
        this.#handlers = {}
    }

    on(eventName, handler) {
        if (WS_EVENTS.includes(eventName)) {
            this.#addHandler(eventName, handler)
        }
    }

    off(eventName, handler) {
        if (WS_EVENTS.includes(eventName)) {
            this.#removeHandler(eventName, handler)
        }
    }

    /**
     * has Decorator ws instance
     * @return {boolean}
     */
    hasConnection() {
        return this.readyState !== undefined
    }

    /**
     * Get connection state or undefined if it not open
     * @return {number|undefined}
     */
    get readyState() {
        return centrifuge?._status == 'connected' ? centrifuge._status : undefined
    }

    static get getSock() {
        return this.#instance
    }

    /**
     * Try to open connection
     */

    open() {
        if (!this.hasConnection()) {
            centrifuge = new Centrifuge(this.#configuration.url, {
                debug: true,
                maxRetry: 5000
            })
            centrifuge.setToken(this.#configuration.userToken);
            centrifuge.connect();
            WS_EVENTS.forEach(e => centrifuge.addEventListener(e, this.#getEventListener()))
        } else throw Error('Trying to open connected')
    }

    /**
     * Try to close connection if exists
     */
    close() {
        if (this.hasConnection()) {
            this.#instance.close()
            this.#instance = undefined
        }
    }

    /**
     * Clean & clear
     */
    erase() {
        if (this.#instance) {
            WS_EVENTS.forEach(e => this.#instance.removeEventListener(e, this.#getEventListener()))
            this.#instance.close()
        }

        this.#handlers = {}
    }

    /**
     * @param {String} eventName
     * @param {Function} handler
     */
    #addHandler(eventName, handler) {
        if (Object.prototype.hasOwnProperty.call(this.#handlers, eventName)) {
            this.#handlers[eventName].push(handler)
        } else this.#handlers[eventName] = [handler]
    }

    /**
     * @param {string} eventName
     * @param {function} handler
     */
    #removeHandler(eventName, handler) {
        if (Object.prototype.hasOwnProperty.call(this.#handlers, eventName) && this.#handlers[eventName].includes(handler)) {
            this.#handlers.splice(this.#handlers[eventName].indexOf(handler), 1)
        }
    }

    #getEventListener() {
        if (this.#eventListener === undefined) {
            this.#eventListener = (event) => {
                if (Object.prototype.hasOwnProperty.call(this.#handlers, event.type)) {
                    this.#handlers[event.type].forEach(h => h(event))
                }
            }
        }

        return this.#eventListener
    }
}