const {requestPropertyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    nameValidator,
    passwordValidator,
    lastNameValidator,
    aboutValidator,
    organizationValidator,
    visibilityValidator,
    usernameValidator,
} = require("./fieldValidators");
const {isMongoId} = require("validator");

const getUserByUsernameValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['username', usernameValidator],
        ]
    );
    validateParams(req);
    next();
};

const getUserByIDValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ]
    );
    validateParams(req);
    next();
};


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
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [],
        [
        ['name', nameValidator],
        ['lastName', lastNameValidator],
        ['password', passwordValidator],
        ['about', aboutValidator],
        ['organization', organizationValidator],
        ['visibility', visibilityValidator],
    ]
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ]
    );
    validateParams(req);
    validateBody(req);
    next();
};


module.exports = {
    getUserByUsernameValidator,
    getUserByIDValidator,
    updateProfileValidator,
};