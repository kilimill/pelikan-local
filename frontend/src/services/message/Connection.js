/*eslint no-dupe-class-members: "off"*/
import CycledArrayIterator from "@/abstract/CycledArrayIterator";
import mitt from "mitt"
import {WebSocketDecorator, WS_EVENTS, centrifuge} from "@/abstract/WebSocketDecorator";

// import camelCase from "camelcase";
/**
 * @type {import("vuex/types").Plugin}
 * @param {import("vuex/types").Store} store
 */
export default class Connection {

    /** Simple reconnection */
    reconnectionStrategy = connection => {
        connection.close()
        setTimeout(() => connection.open(), 5000)
    }
    /** @type {function} */
    #reconnectionRunner

    /** @type {String} */
    #route

    /** @type {String} */
    #userToken

    /** @type {CycledArrayIterator} */
    #serverList

    /** @type {string} */
    #protocol

    /** @type {WebSocketDecorator} */
    #webSocket

    /** @type {import("mitt").Emitter} */
    #emitter

    /**
     *
     * @param {String} route
     * @param {String[]} servers
     * @param {String} protocol
     * @param {Function} reconnection
     */
    constructor(route, {
        servers = [],
        protocol = 'ws',
        reconnection = undefined
    }, userToken) {
        this.#route = route
        this.#userToken = userToken
        this.#serverList = new CycledArrayIterator(servers)
        this.#protocol = protocol
        this.reconnectionStrategy = reconnection || this.reconnectionStrategy
        this.#emitter = mitt()
        this.on('error', this.#getReconnectionRunner())
    }

    static get EVENTS() {
        return [...WS_EVENTS, "internal-error"]
    }

    static get centrifuge() {
        return centrifuge
    }

    // static get getSock() {
    //     return this.#webSocket.getSock()
    // }

    on(eventType, handler) {
        this.#emitter.on(eventType, handler)
    }

    off(eventType, handler) {
        this.#emitter.off(eventType, handler)
    }

    clear() {
        if (this.#webSocket) {
            this.#webSocket.erase()
            this.#webSocket = undefined
        }
        this.#emitter.all.clear()
    }

    open() {
        let server = this.#serverList.next(),
            route = this.#route.replace(/^\//, ""),
            proto = this.#protocol
        this.close()
        try {
            this.#webSocket = new WebSocketDecorator(`${proto}://${server}/${route}`, ['wss'], this.#userToken)
            WS_EVENTS.forEach(eventType => this.#webSocket.on(eventType, e => this.#emitter.emit(eventType, e)))
            this.#webSocket.open()
            console.log(this.#webSocket.getSock())
        } catch (e) {
            this.#webSocket = null
            this.#emitter.emit('internal-error', e)
        }
    }

    close() {
        if (this.hasConnection()) {
            this.off('error', this.#getReconnectionRunner())
            this.#webSocket.close()
            this.#webSocket = undefined
            this.on('error', this.#getReconnectionRunner())
        }
    }

    reconfigure({servers = [], protocol = this.#protocol}) {
        this.#serverList = servers.length ? new CycledArrayIterator(servers) : this.#serverList
        this.#protocol = protocol

        if (this.isOpen()) {
            this.open()
        }
    }

    hasConnection() {
        return this.readyState !== undefined
    }

    isOpen() {
        return this.readyState === WebSocket.OPEN || this.readyState === WebSocket.CONNECTING
    }

    /**
     * WS ReadyState
     * @return {number|undefined}
     */
    get readyState() {
        return this.#webSocket ? this.#webSocket.readyState : undefined
    }


    /**
     * @return {String}
     */
    get route() {
        return this.#route
    }

    /**
     * @return {Array}
     */
    get servers() {
        return this.#serverList.toArray()
    }

    /**
     * @return {Function}
     */
    #getReconnectionRunner() {
        return this.#reconnectionRunner || (this.#reconnectionRunner = (() => {
            this.reconnectionStrategy(this)
        }));
    }
}