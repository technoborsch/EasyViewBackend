const requestFactory = require("../../../utils/RequestFactory");

/***
 * Function that performs request to the server to get self profile
 *
 * @param {string} token Access token
 * @returns {Promise<Response>} Promise with response from server
 */
const getUsers = (token) => requestFactory(
    'get',
    '/user',
    token,
);

const getUserByUsername = (username) => requestFactory(
    'get',
    '/user/username/' + username,
);

/***
 * Function that performs request to the server to edit user's profile
 *
 * @param {string} token Access token
 * @param {string} id User ID that should be changed
 * @param {Object} data Data to update
 * @returns {Promise<Response>} Promise with response from server
 */
const updateProfile = (token, id, data) => requestFactory(
    'post',
    '/user/' + id,
    token,
    data,
);

/***
 * Function that performs request to the server to delete user's profile
 *
 * @param {string} token Access token
 * @returns {Promise<Response>} Promise with response from server
 */
const deleteProfile = (token) => requestFactory(
    'delete',
    '/user',
    token
);

const getProtected = (token) => requestFactory(
    'get',
    '/user/test/protected',
    token,
);

module.exports = {
    getUsers,
    getUserByUsername,
    updateProfile,
    deleteProfile,
    getProtected
};