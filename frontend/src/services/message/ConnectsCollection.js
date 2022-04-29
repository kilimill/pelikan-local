/**
 * @typedef {import("@/services/message/Connection").default} Connection
 */

export default class ConnectsCollection {
    /** @type {Connection[]} */
    #collection

    /** @param {Connection[]} collection */
    constructor(collection = []) {
        this.#collection = collection
    }

    /**
     *
     * @param {function(value:Connection, index: number, array: Connection[])} callback
     */
    each(callback) {
        this.#collection.forEach(callback)
    }

    /**
     * @param {string} channelName
     */
    hasConnection(channelName) {
        return this.channels.includes(channelName)
    }

    /**
     * @param {string} channelName
     * @return {Connection}
     */
    getConnection(channelName) {
        return this.#collection.find(connection => connection.channel === channelName)
    }

    /**
     * @param {Connection} connection
     */
    addConnection(connection) {
        if (!this.hasConnection(connection.channel)) {
            this.#collection.push(connection)
        }
    }

    /**
     * @param {string} channelName
     */
    removeConnection(channelName) {
        let index = this.#collection.indexOf(this.getConnection(channelName))
        if (this.hasConnection(channelName) && ~index) {
            this.#collection.splice(index, 1)
        }
    }

    /**
     * @return {String[]}
     */
    get channels() {
        return this.#collection.map(i => i.channel)
    }
}