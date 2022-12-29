const {isAlphanumeric} = require("validator");

const {
    startsOrEndsWithWhiteSpace,
    usernameValidator,
    slugValidator,
    idValidator,
} = require('../common');

class BuildingFields {

    static name = (name) => {
        if (name === '') {
            return false
        }
        if (startsOrEndsWithWhiteSpace(name)) {
            return false;
        }
        if (name.length > 50) {
            return false;
        }
        const splitName = name.split(' ');
        for (const part of splitName) {
            if (!isAlphanumeric(part, 'en-US') && !isAlphanumeric(part, 'ru-RU') && part !== '') {
                return false;
            }
        }
        return true;
    };

    static description = (description) => {
        if (description[0] === ' ' || description[description.length - 1] === ' ') {
            return false;
        }
        return description.length < 500;
    };

    static username = usernameValidator;

    static slug = slugValidator;

    static id = idValidator;

}

module.exports = BuildingFields;