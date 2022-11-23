const requestFactory = require("../../../utils/RequestFactory");

/***
 * Function that performs request to the server to get all posts
 *
 * @param {string} token Access token
 * @returns {Promise<Response>} Response from server
 */
const getPosts = async (token) => requestFactory(
    'get',
    '/posts',
    token,
    null,
);

module.exports = { getPosts };