import Rewinder, {EVENT_READY, EVENT_WAIT} from "@/services/playback/rewinder/Rewinder";

export default class SeekRewinder extends Rewinder {

    checkOptions(options) {
        return "seek" in options
    }

    handleRequest(receiver) {
        return new Promise((resolve, reject) => this.process(receiver, resolve, reject))
    }

    /**
     *
     * @param {Function} receiver
     * @param {Function} resolve
     * @param {Function} reject
     */
    process(receiver, resolve, reject) {
        let request = this.manager.cursor(IDBKeyRange.upperBound(this.options['seek'], true)),
            message = undefined
        this.manager.dispatchEvent(EVENT_WAIT)
        request.addEventListener('success', () => {
            let cursor = request.result,
                value  = cursor?.value

            if (cursor && value) {
                receiver(message = value)
                cursor.continue()
            } else {
                resolve(message?.time_created || this.options['seek'])
                this.manager.dispatchEvent(EVENT_READY)
            }
        })
        request.addEventListener('error', event => reject(event))
    }
}