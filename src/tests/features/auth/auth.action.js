const {
    registerUser,
    activate,
    signin
} = require("./auth.request");
const extractDataFromEmailLink = require("../../../utils/ExtractDataFromEmailLink");

/***
 * Function that performs user's registration, activation and login and returns promise with received access token.
 *
 * @param {string} email User's email
 * @param {string} name User's name
 * @param {string} lastName User's lastname
 * @param {string} password User's password
 * @param {string} [patronymic] User's patronymic
 * @returns {Promise<string>} Promise with access token
 */
const registerActivateAndLogin = async (email, name, lastName, password, patronymic) => {
    await registerUser(email);
    const data = await extractDataFromEmailLink(email);
    const token = data[0];
    const id = data[1];
    await performActivation(id, token, name, lastName, password, patronymic);
    const userAndToken = await performLogin(email, password);
    return userAndToken.token;
};

/***
 * Function that performs activation af a user using user id and token received during registration
 *
 * @param {string} id User id
 * @param {string} token Received token
 * @param {string} name User's name
 * @param {string} lastName User's lastname
 * @param {string} password Account password
 * @param {string} [patronymic] User's patronymic
 * @returns {Promise<Object>} Promise with response from server
 */
const performActivation = async (id, token, name, lastName, password, patronymic) => {
    const response = await activate(id, token, name, lastName, password, patronymic);
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