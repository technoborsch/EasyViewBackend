const AuthFields = require('../auth/auth.fields');
const {
    isAlpha,
    isLength,
    isInt
} = require("validator");
const {startsOrEndsWithWhiteSpace} = require("../common");

class UserFields extends AuthFields {

    static name = (name) => {
        if (!isAlpha(name, 'en-US') && !isAlpha(name, 'ru-RU')) {return false}
        return isLength(name, 2, 100);
    };

    static lastName = (lastName) => {
        if (!isAlpha(lastName, 'en-US') && !isAlpha(lastName, 'ru-RU')) {return false}
        return isLength(lastName, 1, 100);
    };

    static organization = (organization) => {
        if (startsOrEndsWithWhiteSpace(organization)) {return false}
        return isLength(organization, 1, 100);
    };

    static about = (about) => {
        if (startsOrEndsWithWhiteSpace(about)) {return false}
        return isLength(about, 1, 500);
    };

    static visibility = (visibilityNumber) => {
        if (!isInt('' + visibilityNumber)) {return false;}
        return visibilityNumber >= 1 && visibilityNumber <= 3;
    };

}

module.exports = UserFields;