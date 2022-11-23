const {isAlpha, isBase64} = require('validator');

const nameValidator = (name) => {
    if (!isAlpha(name, 'ru-RU') || !isAlpha(name)) {return false}
    return name.length >= 2 && name.length <= 100;
};

const passwordValidator = (password) => {
    return password.length >= 6 && password.length <= 100;
};

const loginHeaderValidator = (header) => {
    const splitHeader = header.split[' '];
    if (splitHeader.length !== 2) {return false;}
    if (splitHeader[0] !== 'Bearer') {return false;}
    return isBase64(splitHeader[1]);
};

module.exports = {
    nameValidator,
    passwordValidator,
    loginHeaderValidator,
};