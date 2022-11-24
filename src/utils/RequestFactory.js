/***
 * Factory to produce fetch requests against the API
 *
 * @param {string} method Method of a request e.g. post, get, delete, update etc
 * @param {string} url Relative url of a request e.g. /posts, /users etc
 * @param {string|null} [token] Access token if any
 * @param {Object|null} [body] Request body if any
 * @param {string|null} [login] Baseauth login, should be provided together with password
 * @param {string|null} [password] Baseauth password, should be provided together with login
 * @returns {Promise<Response>} Promise with response from server
 */
const requestFactory = (method, url, token, body, login, password) => {
    const baseUrl = 'http://localhost:8020/api/v1';
    const init = {
        method: method,
    }
    if (body) {
        init.body = JSON.stringify(body);
        init.headers = { ...init.headers, 'Content-Type': 'application/json;charset=utf-8'};
    }
    if (token) {
        init.headers = { ...init.headers, 'Authorization': 'Token ' + token};
    }
    if (login && password)
        init.headers = {
        ...init.headers,
        'Authorization': 'Bearer ' + Buffer.from(login + ':' + password, 'utf-8').toString('base64')
    }
    return fetch(baseUrl + url, init);
}

module.exports = requestFactory;