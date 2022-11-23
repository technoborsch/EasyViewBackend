/***
 * Function used to generate valid example emails
 *
 * @returns {string} random valid email
 */
const generateUserEmail = () => {
    return 'user' + (Math.floor(Math.random() * 10000000)).toString() + '@example.com';
};

module.exports = {generateUserEmail};