const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {nameValidator, passwordValidator} = require("./fieldValidators");
const {isAlpha} = require("validator");

const updateProfileValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory([],
        [
        ['name', nameValidator],
        ['lastName', isAlpha],
        ['patronymic', isAlpha],
        ['password', passwordValidator],
    ]);
    validateBody(req);
    next();
};

module.exports = {updateProfileValidator};