const {
    isAlpha,
    isAlphanumeric,
    isBase64,
    isJWT,
    isSlug,
    isStrongPassword,
    isLength,
    isInt,
    isBoolean,
    isMongoId,
} = require('validator');

const startsOrEndsWithWhiteSpace = (string) => {
    return string[0] === ' ' || string[string.length - 1] === ' ';
};

const usernameValidator = (username) => {
    if (!isAlphanumeric(username) && !isSlug) {return false}
    return isLength(username, 5, 50);
};

const nameValidator = (name) => {
    if (!isAlpha(name, 'en-US') && !isAlpha(name, 'ru-RU')) {return false}
    return isLength(name, 2, 100);
};

const lastNameValidator = (lastName) => {
    if (!isAlpha(lastName, 'en-US') && !isAlpha(lastName, 'ru-RU')) {return false}
    return isLength(lastName, 1, 100);
};

const organizationValidator = (organization) => {
    if (startsOrEndsWithWhiteSpace(organization)) {return false}
    return isLength(organization, 1, 100);
};

const aboutValidator = (about) => {
    if (startsOrEndsWithWhiteSpace(about)) {return false}
    return isLength(about, 1, 500);
}

const passwordValidator = (password) => {
    return isStrongPassword(password, {minSymbols: 0});
};

const visibilityValidator = (visibilityNumber) => {
    if (!isInt('' + visibilityNumber)) {return false;}
    return visibilityNumber >= 1 && visibilityNumber <= 3;
}

const loginHeaderValidator = (header) => {
    const splitHeader = header.split(" ");
    if (splitHeader.length !== 2) {return false;}
    if (splitHeader[0] !== 'Bearer') {return false;}
    return isBase64(splitHeader[1]);
};

const tokenHeaderValidator = (header) => {
    const splitHeader = header.split(" ");
    if (splitHeader.length !== 2) {return false;}
    if (splitHeader[0] !== 'Token') {return false;}
    return isJWT(splitHeader[1]);
};

const projectNameValidator = (name) => {
    if (name === '') {return false}
    if (startsOrEndsWithWhiteSpace(name)) {return false;}
    if (name.length > 50) {return false;}
    const splitName = name.split(' ');
    for (const part of splitName) {
        if (!isAlphanumeric(part, 'en-US') && !isAlphanumeric(part, 'ru-RU') && part !== '') {return false;}
    }
    return true;
};

const projectDescriptionValidator = (description) => {
    if (description[0] === ' ' || description[description.length - 1] === ' ') {return false;}
    return description.length < 500;
};

const projectParticipantsValidator = (participants) => {
    if (!Array.isArray(participants)) {return false;}
    for (const userID of participants) {
        if (!userID || !isMongoId('' + userID)) {
            return false;
        }
    }
    return true;
};

const projectPrivateValidator = (isPrivate) => {
    return isBoolean(isPrivate + ''); //TODO doesnt work as expected
};

const buildingNameValidator = projectNameValidator;

const buildingDescriptionValidator = projectDescriptionValidator;

module.exports = {
    usernameValidator,
    nameValidator,
    lastNameValidator,
    passwordValidator,
    aboutValidator,
    organizationValidator,
    visibilityValidator,
    loginHeaderValidator,
    tokenHeaderValidator,
    projectNameValidator,
    projectDescriptionValidator,
    projectPrivateValidator,
    buildingNameValidator,
    buildingDescriptionValidator,
    projectParticipantsValidator,
};