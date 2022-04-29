import Middleware from "./middleware/Middleware";
import EventEmitter from "@/abstract/EventEmitter";

export default class MiddlewareManager extends EventEmitter {
    /** @type {Middleware[]} */
    #middlewareChain = []
    #position = 0

    /**
     *
     * @param {Middleware} middleware
     */
    accept(middleware) {
        if (middleware instanceof Middleware) {
            this.#middlewareChain.push(middleware)
            middleware.accept(this)
        }
    }

    /**
     * @param {Object} message
     * @return {Promise}
     */
    next(message) {
        if (this.#position < this.#middlewareChain.length) {
            const middleware = this.#middlewareChain[this.#position++]
            return middleware.dispatch(message).then(message => {
                if (message === undefined) {
                    this.#position = 0
                }
                return message
            })
        } else {
            this.#position = 0
            return Promise.resolve(message)
        }
    }

    dispatchMessage(message) {
        return this.next(message)
    }
}