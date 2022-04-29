import Rewinder from "@/services/playback/rewinder/Rewinder";

export default class SkipRewinder extends Rewinder {

    checkOptions(options) {
        return "skip" in options
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
        const {skip, start = 0} = this.options
        const request = this.manager.cursor(IDBKeyRange.lowerBound(start, true))
        let firstMessage = undefined

        request.addEventListener('error', event => reject(event))
        request.addEventListener('success', () => {
            let cursor = request.result,
                event = cursor?.value

            if (event) {
                firstMessage = firstMessage || event

                if (event.data.name === skip) {
                    this.manager.idleTime.idleTime = firstMessage.time_created - event.time_created
                    resolve(event.time_created)
                } else cursor.continue()
            } else resolve(this.manager.timestamp)
        })
    }
}