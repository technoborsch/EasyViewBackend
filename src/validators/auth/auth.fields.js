const {
    isAlphanumeric,
    isSlug,
    isLength,
    isAlpha,
    isStrongPassword,
    isInt,
    isBase64,
    isJWT,
    isEmail,
    isHexadecimal
} = require("validator");

const {
    startsOrEndsWithWhiteSpace,
    idValidator,
} = require('../common');

class AuthFieldsValidator {

    static id = idValidator;

    static token = (token) => {
        return isHexadecimal(token + '');
    };

    static loginHeader = (header) => {
        const splitHeader = header.split(" ");
        if (splitHeader.length !== 2) {return false;}
        if (splitHeader[0] !== 'Bearer') {return false;}
        return isBase64(splitHeader[1]);
    };

    static tokenHeader = (header) => {
        const splitHeader = header.split(" ");
        if (splitHeader.length !== 2) {return false;}
        if (splitHeader[0] !== 'Token') {return false;}
        return isJWT(splitHeader[1]);
    };

    static username = (username) => {
        if (!isAlphanumeric(username) && !isSlug) {return false}
        return isLength(username, 5, 50);
    };

    static email = (email) => {
        return isEmail(email + '');
    };

    static password = (password) => {
        return isStrongPassword(password, {minSymbols: 0});
    };

}

module.exports = AuthFieldsValidator;