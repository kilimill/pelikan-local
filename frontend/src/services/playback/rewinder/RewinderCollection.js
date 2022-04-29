import EventEmitter from "@/abstract/EventEmitter";
import RewinderError from "@/services/playback/exception/RewinderError";
import Rewinder, {AVAILABLE_EVENTS} from "@/services/playback/rewinder/Rewinder";

export default class RewinderCollection extends EventEmitter {
    /** @type {Rewinder[]} */
    #rewindCollection = []

    /**
     *
     * @param {Rewinder[]} collection
     */
    constructor(collection) {
        super();
        this[Symbol.iterator] = this.iterator
        collection.forEach(i => this.add(i))
    }

    /**
     *
     * @return {Generator<Rewinder, void, *>}
     */
    *iterator() {
        let cursor = 0,
            length = this.#rewindCollection.length

        while (cursor < length) {
            yield this.#rewindCollection[cursor++]
        }
    }

    /**
     *
     * @param {Rewinder} rewinder
     */
    add(rewinder) {
        if (rewinder instanceof Rewinder) {
            this.#rewindCollection.push(rewinder)
            AVAILABLE_EVENTS.forEach(eventName => {
                rewinder.addEventListener(eventName, eventData => this.dispatchEvent(eventName, eventData))
            })
        } else throw new RewinderError(`Invalid type ${typeof rewinder}; Rewinder expected`)
    }
}