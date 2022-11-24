const {
    isEmail,
    isMongoId,
    isHexadecimal,
} = require('validator');
const {
    nameValidator,
    passwordValidator,
    loginHeaderValidator,
    lastNameValidator,
    patronymicValidator,
} = require('./fieldValidators')
const {
    bodyValidatorFactory,
    headersValidatorFactory,
} = require("../utils/ValidatorFactory");

/**
 * Validates request that will be provided to signup controller. This data must contain only one attribute "email" with
 * valid email.
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const signupValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['email', isEmail],
        ],
    );
    validateBody(req);
    next();
};

/***
 * Validates data provided in request to activate user.
 * It must contain:
 * "id" attribute with valid MongoDB ID;
 * "password" attribute with valid password;
 * "token" attribute with valid hexadecimal number;
 * "name" attribute with valid name;
 * "lastName" attribute with valid user's lastname;
 * It can contain:
 * "patronymic" with valid user's patronymic.
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const activateValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['id', isMongoId],
            ['password', passwordValidator],
            ['token', isHexadecimal],
            ['name', nameValidator],
            ['lastName', lastNameValidator]
        ],
        [
        ['patronymic', patronymicValidator]
    ]
    );
    validateBody(req);
    next();
};

/**
 * Validator for signin requests.
 * All signin requests must contain "Authorization" header with content in format:
 * "Bearer" + " " + "base64-encoded string of format (login:password)".
 * Request must not contain body.
 * @param req
 * @param res
 * @param next
 */
const signinValidator = (req, res, next) => {
    const validateHeaders = headersValidatorFactory(
        [
            ['Authorization', loginHeaderValidator]
        ]
    );
    validateHeaders(req);
    next();
};

/**
 * Requirements for request to reset password requests are the same that to signup.
 */
const resetPasswordRequestValidator = signupValidator;

/**
 * Validator for data to reset password.
 * It must contain:
 * "id" attribute with valid MongoDB ID;
 * "token" attribute with valid hexadecimal number;
 * "password" attribute with valid password.
 * Any other attribute is not allowed.
 *
 * @param req
 * @param res
 * @param next
 */
const resetPasswordValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['id', isMongoId],
            ['token', isHexadecimal],
            ['password', passwordValidator]
        ],
    );
    validateBody(req);
    next();
};

module.exports = {
    signupValidator,
    activateValidator,
    signinValidator,
    resetPasswordValidator,
    resetPasswordRequestValidator
};