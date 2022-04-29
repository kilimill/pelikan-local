export default class IDBDecorator {
    /** {String} */
    #databaseName

    /** {String} */
    #storeName

    /** @type {string} */
    #key = "time_created"

    /** @type {IDBDatabase} */
    #connection


    /**
     *
     * @param {string} dbName
     * @param {string} storeName
     */
    constructor(dbName, storeName) {
        this.#databaseName = dbName
        this.#storeName = storeName
    }

    /**
     *
     * @return {string}
     */
    get key() {
        return this.#key
    }

    /**
     *
     * @return {Promise<{upgradeNeeded:boolean}>}
     */
    connect() {
        let upgradeNeeded = false

        if (!this.#connection) {
            return this.#openConnection(db => {
                upgradeNeeded = true
                db.createObjectStore(this.#storeName, {keyPath: this.#key})
            }).then(db => {
                this.#connection = db
                return {upgradeNeeded}
            }).catch(reason => this.deleteDatabase().then(() => Promise.reject(reason)))
        }

        return Promise.resolve({upgradeNeeded})
    }

    /**
     *
     * @param {function(db:IDBDatabase)} onUpgradeNeeded
     * @return {Promise<IDBDatabase>}
     */
    #openConnection(onUpgradeNeeded) {
        const openRequest = indexedDB.open(this.#databaseName)

        return new Promise((resolve, reject) => {
            openRequest.addEventListener('upgradeneeded', () => onUpgradeNeeded(openRequest.result))
            openRequest.addEventListener('success', () => resolve(openRequest.result))
            openRequest.addEventListener('error', () => reject(openRequest.error))
        })
    }

    /**
     *
     * @param {IDBKeyRange} [query]
     * @return {IDBRequest<IDBCursorWithValue | null>}
     */
    read(query = undefined) {
        if (this.#connection) {
            const transaction = this.#connection.transaction(this.#storeName, "readonly")
            return transaction.objectStore(this.#storeName).openCursor(query)
        } else throw new Error('Not connected')
    }

    /**
     * TODO: Обработка ConstraintError
     * @param {Object[]} data
     * @return {Promise<unknown>}
     */
    async write(data) {
        if (this.#connection) {
            let transaction = this.#connection.transaction(this.#storeName, "readwrite"),
                objectStore = transaction.objectStore(this.#storeName)
            return new Promise((resolve, reject) => {
                transaction.addEventListener('complete', () => resolve())
                transaction.addEventListener('error', reject)
                data.forEach(i => objectStore.add(i))
            })
        } else return Promise.reject('Not connected')
    }

    /**
     *
     * @return {Promise<unknown>}
     */
    async deleteDatabase() {
        let request = indexedDB.deleteDatabase(this.#databaseName)

        return new Promise((resolve, reject) => {
            request.addEventListener('success', () => resolve())
            request.addEventListener('error', () => reject(request.error))
        })
    }
}