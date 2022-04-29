export default class StoreWrapper {

    indexedDB = undefined
    dataBaseName = undefined
    objectStoreName = undefined
    db = undefined

    constructor() {
        this.createIndexedDB()
    }

    configure(dataBaseName, objectStoreName) {
        this.dataBaseName = dataBaseName
        this.objectStoreName = objectStoreName
        return new Promise((resolve, reject) => {
            this.openIndexedDb(dataBaseName)
                .then(() => {
                    if (Object.values(this.db.objectStoreNames).includes(objectStoreName)) {
                        return this.clearObjectStore()
                    }
                    return this.createNewObjectStore(objectStoreName)
                })
                .then(resolve)
                .catch(e => reject(e))
        })
    }

    openIndexedDb(dataBaseName) {
        return new Promise((resolve, reject) => {
            const openRequest = this.indexedDB.open(dataBaseName)
            openRequest.onsuccess = event => {
                this.db = event.target.result
                resolve(event.target.result)
            }
            openRequest.onerror = event => reject(event.target)
        })
    }

    createNewObjectStore(newObjectStoreName) {
        return new Promise((resolve, reject) => {
            const newVersion = this.db.version + 1
            this.db.close()
            const openRequest = this.indexedDB.open(this.dataBaseName, newVersion)
            openRequest.onupgradeneeded = event => {
                const newVersionDb = event.target.result
                newVersionDb.createObjectStore(newObjectStoreName, {keyPath: 'time_created'})
            }
            openRequest.onsuccess = event => {
                this.db = event.target.result
                resolve(this.db)
            }
            openRequest.onerror = event => reject(event.target)
        })
    }

    createIndexedDB() {
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    }

    clearObjectStore() {
        const store = this.getStore('readwrite')
        return new Promise((resolve, reject) => {
            const add = store.clear()
            add.onsuccess = () => resolve()
            add.onerror = error => reject(error)
        })
    }

    getStore(type = undefined) {
        return this.db.transaction(this.objectStoreName, type).objectStore(this.objectStoreName)
    }
}