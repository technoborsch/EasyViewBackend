const {
    isNumeric,
    isBoolean
} = require("validator");
const {
    startsOrEndsWithWhiteSpace,
    usernameValidator,
    slugValidator,
    idValidator,
} = require("../common");


class ViewpointFields {

    static id = idValidator;

    static description = (description) => {
        if (description[0] === ' ' || description[description.length - 1] === ' ') {return false;}
        return description.length < 500;
    };

    static position = (position) => {
        if (!Array.isArray(position)) {return false;}
        if (position.length !== 3) {return false;}
        for (const value of position) {
            if (!isNumeric(value + '')) {return false;}
        }
        return true;
    };

    static quaternion = (quaternion) => {
        if (!Array.isArray(quaternion)) {return false;}
        if (quaternion.length !== 4) {return false;}
        for (const value of quaternion) {
            if (!isNumeric(value + '')) {return false;}
        }
        return true;
    };

    static fov = (fov) => {
        if (!isNumeric(fov + '')) {return false;}
        return 0 < fov && fov < 150;
    };

    static public = (isPublic) => {
        return isBoolean(isPublic + '');
    };

    static distanceToTarget = (distance) => {
        if (!isNumeric(distance + '')) {return false;}
        return 0 < distance;
    };

    static clipConstantsStatus = (clipConstantsStatus) => {
        if (!Array.isArray(clipConstantsStatus)) {return false;}
        if (clipConstantsStatus.length !== 6) {return false;}
        for (const value of clipConstantsStatus) {
            if (!isBoolean(value + '')) {return false;}
        }
        return true;
    };

    static clipConstants = (clipConstants) => {
        if (!Array.isArray(clipConstants)) {return false;}
        if (clipConstants.length !== 6) {return false;}
        for (const value of clipConstants) {
            if (!isNumeric(value + '')) {return false;}
        }
        return true;
    };
}

module.exports = ViewpointFields;