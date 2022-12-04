const requestFactory = require("../../../utils/RequestFactory");

/***
 * Function that performs request to the server to get self profile
 *
 * @param {string} token Access token
 * @returns {Promise<Response>} Promise with response from server
 */
const getMyProfile = (token) => requestFactory(
    'get',
    '/user',
    token,
);

/***
 * Function that performs request to the server to edit user's profile
 *
 * @param {string} token Access token
 * @param {string} [name] New name
 * @param {string} [password] New password
 * @param {string} [lastName] New lastname
 * @param {string} [about] New about
 * @param {string} [organization] New organization
 * @returns {Promise<Response>} Promise with response from server
 */
const updateProfile = (token, name, password, lastName, about, organization) => requestFactory(
    'post',
    '/user',
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
 * @returns {Promise<Response>} Promise with response from server
 */
const deleteProfile = (token) => requestFactory(
    'delete',
    '/user',
    token
);

module.exports = {
    getMyProfile,
    updateProfile,
    deleteProfile,
};