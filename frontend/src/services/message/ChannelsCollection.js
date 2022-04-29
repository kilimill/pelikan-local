import Channel from "@/services/message/Channel";

export default class ChannelsCollection {
    /** @type {Channel[]} */
    #collection

    /**
     * @param {Channel[]} collection
     */
    constructor(collection = []) {
        this.#collection = collection
    }

    /**
     * @param {string} name
     */
    hasChannel(name) {
        return this.names.includes(name)
    }

    /**
     * @param {string} name
     * @return {Channel}
     */
    getChannel(name) {
        return this.#collection.find(item => item.name === name)
    }

    /**
     * @param {string} name
     */
    removeChannel(name) {
        let index = this.#collection.indexOf(this.getChannel(name))

        if (~index) {
            this.#collection.splice(index, 1)
        }
    }

    /**
     * @param {string} name
     * @return {Channel|undefined}
     */
    addChannel(name) {
        if (!this.hasChannel(name)) {
            let i = this.#collection.push(new Channel(name))
            return this.#collection[i - 1]
        }
        
        return undefined
    }

    /**
     * @return {string[]}
     */
    get names() {
        return this.#collection.map(item => item.name)
    }

    /**
     * Get copy of array
     * @return {Channel[]}
     */
    get entries() {
        return this.#collection.map(i => i)
    }
}