/*eslint no-dupe-class-members: "off"*/
import IDBDecorator from "@/services/playback/store/IDBDecorator";
import MiddlewareManager from "@/services/playback/MiddlewareManager";
import EventEmitter from "@/abstract/EventEmitter";
import RewindManager from "@/services/playback/RewindManager";
import {EVENT_ERROR, EVENT_MESSAGE, EVENT_READY, EVENT_SEEK, EVENT_WAIT} from "@/services/playback/rewinder/Rewinder";
import {EVENT_FINISH, EVENT_RETURN, EVENT_START} from "@/services/playback/middleware/Middleware";

export const EVENT_WAITING = "playback:waiting"
export const EVENT_CANPLAY = "playback:canplay"
export const EVENT_FINISHED = "playback:finished"
export const EVENT_STARTED = "playback:started"
export const EVENT_TIMEUPDATE = "playback:timeupdate"
export const EVENT_SEEKING = "playback:seeking"
export const EVENT_SEEKED = "playback:seeked"

export const EVENT_PLAYBACK_INIT = "playback:init"
export const EVENT_PLAYBACK_READY = "playback:ready"

export default class PlaybackService extends EventEmitter {
    /** @type {IDBDecorator} */
    #idb

    /** @type {MiddlewareManager} */
    #middleware

    /** @type {RewindManager} */
    #rewinder

    /** {} */
    #eventSource

    #canplay = false

    constructor() {
        super()
        this.#middleware = new MiddlewareManager()
        this.#rewinder = new RewindManager()
        this.#dispatch()
    }

    /**
     *
     * @param {{dbName:string, storeName:string, syncMethod:function():Promise<[]|null>}} config
     * @return {Promise<unknown>}
     */
    async configure({dbName, storeName, syncMethod}) {
        this.#idb = new IDBDecorator(dbName, storeName)
        return this.#idb.connect()
            .then(({upgradeNeeded}) => upgradeNeeded
                ? this.#sync(syncMethod)
                : Promise.resolve()
            ).then(() => {
                this.#canplay = true
                this.dispatchEvent(EVENT_PLAYBACK_INIT)
                this.dispatchEvent(EVENT_PLAYBACK_READY)
            })
    }

    /**
     * @return {IDBDecorator}
     */
    get idb() {
        return this.#idb;
    }

    /**
     *
     * @return {MiddlewareManager}
     */
    get middleware() {
        return this.#middleware
    }

    /**
     *
     * @param {{addEventListener:function}} eventSource
     */
    addEventSource(eventSource) {
        this.#eventSource = eventSource
        eventSource.addEventListener(EVENT_TIMEUPDATE, ({currentTime})=> this.#rewinder.rewind({time: currentTime}))
        eventSource.addEventListener(EVENT_SEEKING, event => {
            this.#rewinder.rewind(event)
            this.dispatchEvent(EVENT_SEEKING, event)
        })
    }

    /**
     *
     * @param {function():Promise} syncMethod
     * @return Promise
     */
    async #sync(syncMethod) {
        return syncMethod().then(data => {
            return data?.items
                ? this.idb.write(data.items).then(() => this.#sync(syncMethod))
                : Promise.resolve()
        })
    }

    /**
     * Dispatching events
     */
    #dispatch() {
        this.addEventListener(EVENT_PLAYBACK_READY, () => this.#rewinder.init(this.idb))
        //this.addEventListener()
        this.#rewinder.addEventListener(EVENT_MESSAGE, event => this.#dispatchMessage(event))
        this.#rewinder.addEventListener(EVENT_ERROR, event => console.error(event))
        this.#middleware.addEventListener(EVENT_RETURN, event => this.#rewinder.rewind(event))
        this.#middleware.addEventListener(EVENT_START, () => this.dispatchEvent(EVENT_STARTED))
        this.#middleware.addEventListener(EVENT_FINISH, () => {
            this.dispatchEvent(EVENT_FINISHED)
            this.#rewinder.flushQueue()
            this.#rewinder.idleTime.reset()
            this.#rewinder.rewind({start: 0, skip: "event.start"})
        })
        //this.#middleware
        this.#rewinder.addEventListener(EVENT_WAIT, () => this.dispatchEvent(EVENT_WAITING))
        this.#rewinder.addEventListener(EVENT_READY, () => this.dispatchEvent(EVENT_CANPLAY))
        this.#rewinder.addEventListener(EVENT_SEEK, () => this.dispatchEvent(EVENT_SEEKED))
    }

    /**
     * @param {Object|any} [messageEvent]
     */
    #dispatchMessage(messageEvent) {
        console.log('dispatch', messageEvent)
        this.middleware.dispatchMessage(messageEvent)
            .then(message => message
                ? this.dispatchEvent('message', message.data)
                : console.log('Сообщение отфильтровано', messageEvent)
            ).catch(reason => console.error(reason))
    }
}