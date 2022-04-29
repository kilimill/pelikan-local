export default class SimpleObjectHydration {
    #destination = {}
    #intermediaries = []

    constructor(destination) {
        this.#destination = destination
    }

    /**
     * @param {{}} source
     * @return {{}}
     */
    hydrate(source = {}) {
        for (let [key, value] of Object.entries(source)) {
            [key, value] = this.#intermediate(key, value)
            this.#set(key, value)
        }
        return this.#destination
    }

    static hydrate(destination, source) {
        return (new this(destination)).hydrate(source)
    }

    /**
     * Add intermediaries
     * @param {function(key:string,value:*):Array|boolean} intermediate
     * @param {string|string[]} [property]
     * @return {SimpleObjectHydration}
     */
    use(intermediate, property) {
        if (property && property.length) {
            property = typeof property === "string" ? [property] : property
            this.#intermediaries.push((key, value) =>
                property.includes(key) ? intermediate(key, value) : [key, value]
            )
        } else this.#intermediaries.push(intermediate)

        return this
    }

    /**
     * @param {string|boolean} property
     * @param {*} value
     */
    #set(property, value) {
        if (property && Object.prototype.hasOwnProperty.call(this.#destination, property)) {
            this.#destination[property] = value
        }
    }

    // eslint-disable-next-line no-dupe-class-members
    #intermediate(key, value) {
        for (let fn of this.#intermediaries) {
            let result = fn(key, value)

            if (result === true) {
                continue
            }

            if (result instanceof Array) {
                key = result.shift()
                value = result.shift() || value
            } else return [false]
        }

        return [key, value]
    }
}