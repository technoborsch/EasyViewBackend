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

const getUserByUsername = (token, username) => requestFactory(
    'get',
    '/user/username/' + username,
    token,
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
 * @param {string} [id] ID of a user that should be deleted, if no ID then deletes self
 * @returns {Promise<Response>} Promise with response from server
 */
const deleteProfile = (token, id) => requestFactory(
    'delete',
    id? '/user/' + id : '/user',
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