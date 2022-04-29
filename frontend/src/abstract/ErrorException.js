export default class ErrorException extends Error {
    /**
     *
     * @param {string} message
     * @param {number} [code]
     */
    constructor(message, code = 0) {
        super(message);
        this.code = code
    }
}