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
    '/user/' + username,
);

/***
 * Function that performs request to the server to edit user's profile
 *
 * @param {string} token Access token
 * @param {string} username Username of user that should be changed
 * @param {string} [name] New name
 * @param {string} [password] New password
 * @param {string} [lastName] New lastname
 * @param {string} [about] New about
 * @param {string} [organization] New organization
 * @returns {Promise<Response>} Promise with response from server
 */
const updateProfile = (token, username, name, password, lastName, about, organization) => requestFactory(
    'post',
    '/user/' + username,
    token,
    {
        name: name,
        lastName: lastName,
        password: password,
        about: about,
        organization: organization,
    }
);

/***
 * Function that performs request to the server to delete user's profile
 *
 * @param {string} token Access token
 * @param {string} username Username of user that should be changed
 * @returns {Promise<Response>} Promise with response from server
 */
const deleteProfile = (token, username) => requestFactory(
    'delete',
    '/user/' + username,
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