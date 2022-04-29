import EventObserver from "@/abstract/EventObserver";
import SubscriptionException from "@/services/notify/exceptions/SubscriptionException";

export default class NotifyService {
    constructor() {
        this.publisher = new EventObserver()
    }

    /**
     * Notification message
     * @param {number} from user ID
     * @param {string} message text
     */
    broadcast(from, message) {
        this.publisher.broadcast({from: Number(from), message: String(message)})
    }

    /**
     * @param {Function} subscriber
     * @return {Function} unsubscribe
     */
    subscribe(subscriber) {
        if (typeof subscriber === "function") {
            return this.publisher.subscribe(({from, message}) => subscriber(Number(from), String(message)))
        } else throw new SubscriptionException(`Unexpected type {${typeof subscriber}}; Function expected`)
    }
}