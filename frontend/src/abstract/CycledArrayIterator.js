export default class CycledArrayIterator {
    #entries
    #current

    /**
     *
     * @param {Object|Array|[]} traversable
     */
    constructor(traversable) {
        this.#entries = Object.values(traversable)
        this.#current = 0
    }

    /**
     *
     * @return {undefined|*}
     */
    next() {
        if (this.#entries.length === 0) {
            return undefined
        }

        if (this.#current >= this.#entries.length) {
            this.#current = 0;
        }

        return this.#entries[this.#current++]
    }

    /**
     * Returns count of traversable
     * @return {Number}
     */
    count() {
        return this.#entries.length
    }

    /**
     * Gets clone of traversable
     * @return {Array}
     */
    toArray() {
        return this.#entries.map(entry => entry)
    }
}