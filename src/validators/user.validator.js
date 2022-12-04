const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    nameValidator,
    passwordValidator,
    lastNameValidator,
    aboutValidator,
    organizationValidator,
} = require("./fieldValidators");

/**
 * Validator for requests to update profile.
 * It can contain (but must contain at least one of):
 * "password" attribute with valid password;
 * "name" attribute with valid name;
 * "lastName" attribute with valid user's lastname;
 * "about" attribute with valid information about user;
 * "organization" attribute with valid information about user's organization;
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
        ['password', passwordValidator],
        ['about', aboutValidator],
        ['organization', organizationValidator],
    ]);
    validateBody(req);
    next();
};

module.exports = {updateProfileValidator};