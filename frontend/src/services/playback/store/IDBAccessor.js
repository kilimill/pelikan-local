export default class IDBAccessor {
    /** @type {IDBDecorator} */
    #database

    /**
     * @constructor
     * @param {IDBDecorator} db
     */
    constructor(db) {
        this.#database = db
    }
}