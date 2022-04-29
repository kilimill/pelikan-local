/*eslint no-dupe-class-members: "off"*/
import Rewinder from "@/services/playback/rewinder/Rewinder";
let co = undefined;
let num = 0;
let first = 0;
export default class StepRewinder extends Rewinder {

    checkOptions(options) {
        return "time" in options
    }

    handleRequest(receiver) {
        this.options.time += this.manager.idleTime.correctTime
        if (num === 0) {
            co = this.options.time;
            first = this.manager.timestamp;
            num++
        }
        return new Promise((resolve, reject) => this.#process(receiver, resolve, reject))
    }

    /**
     *
     * @param {Function} receiver
     * @param {Function} resolve
     * @param {Function} reject
     */
    #process(receiver, resolve, reject) {
        let cursorRequest,
        lastMessage = undefined;
        if (co <= this.options.time) {
            cursorRequest = this.manager.cursor(IDBKeyRange.lowerBound(this.manager.timestamp));
        } else {
            cursorRequest = this.manager.cursor(IDBKeyRange.lowerBound(first));
        }
        co = this.options.time;
        console.log('playing');
        cursorRequest.addEventListener('success', () => {
            let cursor = cursorRequest.result
            lastMessage = cursor?.value
            
            if (lastMessage) {
                if (lastMessage.time_created <= this.options.time) {
                    receiver(lastMessage)
                    cursor.continue()
                } else resolve(lastMessage.time_created) //this.dispatchEvent(EVENT_STOP, lastMessage.time_created)
            } else resolve(this.manager.timestamp)//this.dispatchEvent(EVENT_STOP, this.manager.timestamp)
        })

        cursorRequest.addEventListener('error', event => reject(event))
    }
}