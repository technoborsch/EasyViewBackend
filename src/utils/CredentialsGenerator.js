const crypto = require("crypto");

class CredentialsGenerator {
    /***
     * Method used to generate valid example emails
     *
     * @returns {string} random valid email
     */
    static generateUserEmail = () => {
        return 'user' + (Math.floor(Math.random() * 10000000)).toString() + '@example.com';
    };

    static generateUsername = () => {
        return crypto.randomBytes(4).toString('hex');
    };

    static generatePassword = () => {
        return crypto.randomBytes(6).toString('hex') + (Math.floor(Math.random()) * 100).toString() + 'A';
    };

    static generateCredentials = () => {
        return [
            CredentialsGenerator.generateUserEmail(),
            CredentialsGenerator.generateUsername(),
            CredentialsGenerator.generatePassword()
        ];
    };
}

module.exports = CredentialsGenerator;