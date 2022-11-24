const {isAlpha, isBase64, isJWT} = require('validator');

const nameValidator = (name) => {
    if (!isAlpha(name, 'en-US' || !isAlpha(name, 'ru-RU'))) {return false}
    return name.length >= 2 && name.length <= 100;
};

const lastNameValidator = (lastName) => {
    if (!isAlpha(lastName, 'en-US' || !isAlpha(lastName, 'ru-RU'))) {return false}
    return lastName.length >= 1 && lastName.length <= 100;
};

const patronymicValidator = (patronymic) => {
    if (!isAlpha(patronymic, 'en-US' || !isAlpha(patronymic, 'ru-RU'))) {return false}
    return patronymic.length >= 5 && patronymic.length <= 100;
};

const passwordValidator = (password) => {
    return password.length >= 6 && password.length <= 100;
};

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

module.exports = {
    nameValidator,
    lastNameValidator,
    patronymicValidator,
    passwordValidator,
    loginHeaderValidator,
    tokenHeaderValidator,
};