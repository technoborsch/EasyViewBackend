/**
 * Custom error that allows to attach status attribute to an error.
 */
class ReqError extends Error {
    /**
     * @param {string} message Message of an error
     * @param {int} status HTTP response status code
     */
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

module.exports = ReqError;