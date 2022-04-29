export default class Queue {
    /** @type {Array} */
    #stack

    constructor(stack = []) {
        this.#stack = stack
    }

    push(item) {
        this.#stack.push(item)
    }
    pull() {
        return this.has()
            ? this.#stack.shift()
            : undefined
    }
    has() {
        return Boolean(this.#stack.length)
    }
    flush() {
        this.#stack = []
    }
}