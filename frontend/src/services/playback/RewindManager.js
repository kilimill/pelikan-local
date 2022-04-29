/*eslint no-dupe-class-members: "off"*/
import TimeCorrector from "@/services/playback/TimeCorrector";
import RewinderCollection from "@/services/playback/rewinder/RewinderCollection";
import EventEmitter from "@/abstract/EventEmitter";
import IDBDecorator from "@/services/playback/store/IDBDecorator";
import IdleRewinder from "@/services/playback/rewinder/IdleRewinder";
import StepRewinder from "@/services/playback/rewinder/StepRewinder";
import SeekRewinder from "@/services/playback/rewinder/SeekRewinder";

import Queue from "@/abstract/Queue";
import SkipRewinder from "@/services/playback/rewinder/SkipRewinder";

export default class RewindManager extends EventEmitter {

    /** @type {IDBDecorator} */
    #database

    /** @type {RewinderCollection|Generator<Rewinder>} */
    #rewinders

    /** @type {Boolean} */
    #processing

    /** @type {Number} last key */
    #timestamp

    /** @type {TimeCorrector} метки времени остановок **/
    #idleTimes

    #queue

    constructor() {
        super()
        this.#processing = false
        this.#rewinders = new RewinderCollection([
            new IdleRewinder(this),
            new StepRewinder(this),
            new SeekRewinder(this),
            new SkipRewinder(this),
        ])
        this.#idleTimes = new TimeCorrector()
        this.#queue = new Queue()
    }

    /**
     *
     * @return {TimeCorrector}
     */
    get idleTime() {
        return this.#idleTimes
    }

    /**
     * Last requested key
     * @return {Number}
     */
    get timestamp() {
        return this.#timestamp
    }

    /**
     *
     * @param {IDBDecorator} db
     */
    init(db) {
        if ((this.#database = db) instanceof IDBDecorator) {
            this.rewind({idle: 0})
        } else throw new Error('Not connected')
    }

    /**
     * @param {IDBKeyRange} [query]
     * @return {IDBRequest<IDBCursorWithValue | null>}
     */
    cursor(query) {
        return this.#database.read(query)
    }

    /**
     *
     * @param {object} options
     * @return {void}
     */
    rewind(options) {
        for (let rewinder of this.#rewinders) {
            let appliedInstance = rewinder.apply(options)

            if (appliedInstance) {
                this.#queue.push(appliedInstance)
                break
            }
        }
        this.#queueProcess()
    }

    flushQueue() {
        this.#queue.flush()
    }

    #queueProcess() {
        if (this.#requestProcessing()) {
            let receiver = e => this.#eventReceiver(e)

            if (this.#queue.has()) {
                this.#queue.pull().handleRequest(receiver).then(time => {
                    this.#timestamp = Number.isInteger(time) ? time : this.#timestamp
                    this.#releaseProcessing()
                    this.#queueProcess()
                }).catch(reason => console.error(reason))
            } else this.#releaseProcessing()
        }
    }

    #requestProcessing() {
        return this.#processing ? false : this.#processing = true
    }

    #releaseProcessing() {
        this.#processing = false
    }

    #eventReceiver(event) {
        this.dispatchEvent('message', event)
    }
}