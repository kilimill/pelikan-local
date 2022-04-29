import StoreWrapper from "@/services/playback/StoreWrapper";

export class StoreAccessor {

    /**
     *
     * @type {StoreWrapper}
     */
    storeWrapper = undefined
    chunkLength = undefined

    constructor() {
        this.storeWrapper = new StoreWrapper()
    }

    /**
     *
     * @param {String} dataBaseName
     * @param {String} objectStoreName
     * @param {String, Number} chunkLength
     */
    configure(dataBaseName, objectStoreName, chunkLength) {
        this.chunkLength = chunkLength
        return this.storeWrapper.configure(dataBaseName, objectStoreName)
    }

    checkTimestampUniqueness(item) {
        return this.getItem(item['time_created']).then(result => !result)
    }

    prepareNewDBItem(item) {
        return this.checkTimestampUniqueness(item)
            .then(result => {
                if (result) {
                    return item
                } else {
                    return this.prepareNewDBItem({...item, 'time_created': Number(item['time_created']) + 1})
                }
            })
    }

    addItem(item) {
        const store = this.storeWrapper.getStore('readwrite')
        return new Promise((resolve, reject) => {
            const add = store.add(item)
            add.onsuccess = () => resolve()
            add.onerror = error => reject(error)
        })
    }

    getItem(timestamp) {
        return new Promise((resolve, reject) => {
            const request = this.storeWrapper.getStore().get(timestamp)
            request.onsuccess = response => resolve(response.target.result)
            request.onerror = error => reject(error)
        })
    }

    getItemsAll(query, length = undefined) {
        return new Promise((resolve, reject) => {
            const request = this.storeWrapper.getStore().getAll(query, length)
            request.onsuccess = response => resolve(response.target.result)
            request.onerror = error => reject(error)
        })
    }

    async fill(data) {
        for (const item of data) {
            await this.prepareNewDBItem(item).then(i => this.addItem(i))
        }
    }

    async getRange(timestamp) {
        const firstItemTimestamp = (await this.getItemsAll(undefined))[0]['time_created']
        const chunkLengthMs = this.chunkLength * 1000
        const lowRangeTime = firstItemTimestamp + Math.floor((timestamp - firstItemTimestamp) / chunkLengthMs) * chunkLengthMs
        return this.getItemsAll(IDBKeyRange.bound(lowRangeTime, lowRangeTime + chunkLengthMs, true, false))
    }

}