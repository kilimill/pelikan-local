/*eslint no-unused-vars: "off"*/
import MiddlewareManager from "@/services/playback/MiddlewareManager";

export const EVENT_RETURN = "return"
export const EVENT_FINISH = "finish"
export const EVENT_START = "start"

/**
 * @abstract middleware class
 */
export default class Middleware {
    /** @type {MiddlewareManager} */
    #manager;

    get manager() {
        return this.#manager
    }

    accept(manager) {
        if (manager instanceof MiddlewareManager) {
            this.#manager = manager
        }
    }

    /**
     *
     * @param {Object} message
     * @return {Promise}
     */
    next(message) {
        return this.#manager.next(message)
    }

    /**
     * @abstract
     * @param {Object} message
     * @return {Promise}
     */
    dispatch(message) {
        throw new Error('You have to implement the method dispatch!');
    }
}