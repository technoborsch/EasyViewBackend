const {
    isEmail,
    isMongoId,
    isHexadecimal,
    isAlpha,
} = require('validator');
const {
    nameValidator,
    passwordValidator,
    loginHeaderValidator,
} = require('./fieldValidators')
const {
    bodyValidatorFactory,
    headersValidatorFactory,
} = require("../utils/ValidatorFactory");

/**
 * Validates request that will be provided to signup controller. This data must contain only one attribute email with
 * valid email.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const signupValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['email', isEmail]
        ]
    );
    validateBody(req);
    next();
};

const activateValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['id', isMongoId],
            ['password', passwordValidator],
            ['token', isHexadecimal],
            ['name', nameValidator],
            ['lastName', isAlpha]
        ],
        [
        ['patronymic', isAlpha]
    ]
    );
    validateBody(req);
    next();
};

const signinValidator = (req, res, next) => {
    const validateHeaders = headersValidatorFactory(
        [
            ['Authorization', loginHeaderValidator]
        ]
    );
    validateHeaders(req);
    next();
};

const resetPasswordRequestValidator = signupValidator;

const resetPasswordValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['id', isMongoId],
            ['token', isHexadecimal],
            ['password', passwordValidator]
        ]
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