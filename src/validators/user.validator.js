const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    nameValidator,
    passwordValidator,
    lastNameValidator,
    patronymicValidator
} = require("./fieldValidators");

/**
 * Validator for requests to update profile.
 * It can contain (but must contain at least one of):
 * "password" attribute with valid password;
 * "name" attribute with valid name;
 * "lastName" attribute with valid user's lastname;
 * "patronymic" with valid user's patronymic.
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const updateProfileValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory([],
        [
        ['name', nameValidator],
        ['lastName', lastNameValidator],
        ['patronymic', patronymicValidator],
        ['password', passwordValidator],
    ]);
    validateBody(req);
    next();
};

module.exports = {updateProfileValidator};