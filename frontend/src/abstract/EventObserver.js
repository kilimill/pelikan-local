export default class EventObserver {
    #observers = []

    /**
     * @param {Function} callback
     * @return {Function} unsubscribe
     */
    subscribe(callback) {
        const notFound = !~this.#observers.indexOf(callback)

        if (callback instanceof Function && notFound) {
            this.#observers.push(callback)
            return () => this.unsubscribe(callback)
        } else throw new Error(`Invalid type {${typeof callback}}, function expected`)
    }

    /**
     * @param {Function} callback
     * @return {boolean|boolean}
     */
    unsubscribe(callback) {
        const index = this.#observers.indexOf(callback)
        return ~index ? Boolean(this.#observers.splice(index, 1)) : false
    }

    /**
     * @param {*} data
     */
    broadcast(data) {
        this.#observers.forEach(i => i(data))
    }
}