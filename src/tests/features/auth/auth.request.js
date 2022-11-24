const requestFactory = require("../../../utils/RequestFactory");

/***
 * Function that performs fetch request to register new user with given email
 *
 * @param {string} email Email that a new user should be registered with
 * @returns {Promise<Response>} Promise with response from server
 */
let registerUser = (email) => requestFactory(
    'post',
    '/signup',
    null,
    {
        email: email,
    },
);

/***
 * Function that performs fetch request to activate new user with given user id and activation token
 *
 * @param {string} id Id of user that should be activated
 * @param {string} token Token that was given during registration
 * @param {string} name User's name
 * @param {string} lastName User's lastname
 * @param {string} password New account's password
 * @param {string} [patronymic] User's patronymic
 * @returns {Promise<Response>} Promise with response from server
 */
let activate = (id, token, name, lastName, password, patronymic) => requestFactory(
    'post',
    '/activate',
    null,
    {
        id: id,
        token: token,
        name: name,
        lastName: lastName,
        password: password,
        patronymic: patronymic,
    },
);

/***
 * Function that performs login with given email and password
 *
 * @param email Email of a user
 * @param password Password of a user
 * @returns {Promise<Response>} Promise with response from server
 */
let signin = (email, password) => requestFactory(
    'post',
    '/signin',
    null,
    null,
    email,
    password
);

module.exports = {
    registerUser,
    activate,
    signin,
};