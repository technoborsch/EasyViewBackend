const {
    registerUser,
    activate,
    signin
} = require("./auth.request");
const extractDataFromEmailLink = require("../../../utils/ExtractDataFromEmailLink");

/***
 * Function that performs user registration, activation and login and returns promise with received access token.
 *
 * @param {string} email User's email
 * @param {string} username User's name
 * @param {string} password User's password
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>} Promise with access token
 */
const registerActivateAndLogin = async (email, username, password) => {
    await registerUser(email, username, password);
    const data = await extractDataFromEmailLink(email);
    const token = data[0];
    const id = data[1];
    await performActivation(id, token);
    return await performLogin(email, password);
};

/***
 * Function that performs activation af a user using user id and token received during registration
 *
 * @param {string} id User id
 * @param {string} token Received token
 * @returns {Promise<Object>} Promise with response from server
 */
const performActivation = async (id, token) => {
    const response = await activate(id, token);
    return await response.json();
};

/***
 * Function that performs login with given email and password
 *
 * @param {string} email User's email
 * @param {string} password Account password
 * @returns {Promise<Object>}
 */
const performLogin = async (email, password) => {
    const response = await signin(email, password);
    return await response.json();
};

module.exports = {
    registerActivateAndLogin,
    performLogin,
    performActivation,
};