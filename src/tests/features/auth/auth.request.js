const requestFactory = require("../../../utils/RequestFactory");

/***
 * Function that performs fetch request to register new user with given email
 *
 * @param {string} email Email that a new user should be registered with
 * @param {string} username Username that a new user should be registered with
 * @param {string} password Password that a new user should be registered with
 * @returns {Promise<Response>} Promise with response from server
 */
const registerUser = (email, username, password) => requestFactory(
    'post',
    '/signup',
    null,
    {
        email: email,
        username: username,
        password: password,
    },
);

/***
 * Function that performs fetch request to activate new user with given user id and activation token
 *
 * @param {string} id Id of user that should be activated
 * @param {string} token Token that was given during registration
 * @returns {Promise<Response>} Promise with response from server
 */
const activate = (id, token) => requestFactory(
    'post',
    '/activate',
    null,
    {
        id: id,
        token: token,
    },
);

/***
 * Function that performs login with given email/username and password
 *
 * @param emailOrUsername Email or username of a user
 * @param password Password of a user
 * @returns {Promise<Response>} Promise with response from server
 */
const signin = (emailOrUsername, password) => requestFactory(
    'get',
    '/signin',
    null,
    null,
    emailOrUsername,
    password
);

/**
 * Request to log out
 *
 * @param {string} token Valid access token
 * @returns {Promise<Response>} Promise with response from server
 */
const logout = (token) => requestFactory(
    'get',
    '/logout',
    token,
);

/**
 * Request to request sending email to reset a password
 *
 * @param {string} email Email of user that needs password reset
 * @returns {Promise<Response>} Promise with response from server
 */
const resetPasswordRequest = (email) => requestFactory(
    'post',
    '/resetPassword',
    null,
    {
        email: email,
    }
);

/**
 * Request to actually reset password with given token and id
 *
 * @param {string} token Token received in email link
 * @param {string} id Received ID of a user
 * @param {string} password New password
 * @returns {Promise<Response>} Promise with response from server
 */
const resetPassword = (token, id, password) => requestFactory(
    'put',
    '/resetPassword',
    null,
    {
        token: token,
        id: id,
        password: password
    }
);

/**
 * Request to refresh token with current token
 *
 * @param {string} token Current JWT that needs to be refreshed
 * @returns {Promise<Response>} Promise with response from server
 */
const refreshToken = (token) => requestFactory(
    'get',
    '/refreshToken',
    token,
);

module.exports = {
    registerUser,
    activate,
    signin,
    logout,
    resetPasswordRequest,
    resetPassword,
    refreshToken,
};