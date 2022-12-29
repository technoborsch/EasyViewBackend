const {
    requestPropertyValidatorFactory,
    headersValidatorFactory,
    validateThatBodyIsAbsent,
} = require("../../utils/ValidatorFactory");

const fv = require('./auth.fields');

/**
 * Validates request that will be provided to signup controller. This data must contain attributes "email" with
 * valid email, "username" with valid username and "password" with password that is strong enough.
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const signupValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['email', fv.email],
            ['username', fv.username],
            ['password', fv.password],
        ],
    );
    validateBody(req);
    next();
};

/***
 * Validates data provided in request to activate user.
 * It must contain:
 * "id" attribute with valid MongoDB ID of a user that should be activated;
 * "token" attribute with valid hexadecimal number;
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const activateValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['id', fv.id],
            ['token', fv.token],
        ],
    );
    validateBody(req);
    next();
};

/**
 * Validator for signin requests.
 * All signin requests must contain "Authorization" header with content in format:
 * "Bearer" + " " + "base64-encoded string of format (login:password)".
 * Request must not contain a body.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const signinValidator = (req, res, next) => {
    validateThatBodyIsAbsent(req);
    const validateHeaders = headersValidatorFactory(
        [
            ['Authorization', fv.loginHeader]
        ]
    );
    validateHeaders(req);
    next();
};

/**
 * Validates requests to reset password requests, must contain only "email" attribute with valid email.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const resetPasswordRequestValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
        ['email', fv.email],
    ]);
    validateBody(req);
    next();
};

/**
 * Validator for data to reset password.
 * It must contain:
 * "id" attribute with valid MongoDB ID;
 * "token" attribute with valid hexadecimal number;
 * "password" attribute with valid password.
 * Any other attribute is not allowed.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const resetPasswordValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['id', fv.id],
            ['token', fv.token],
            ['password', fv.password]
        ],
    );
    validateBody(req);
    next();
};

/**
 * Function that validates request to refresh token route. A request must not contain a body.
 *
 * @param req Validated request
 * @param res Response object
 * @param next Next function
 */
const refreshTokenValidator = (req, res, next) => {
    validateThatBodyIsAbsent(req);
    next();
};

/**
 * Log out validator is the same as refresh token validator - request must not contain body
 */
const logOutValidator = refreshTokenValidator;

module.exports = {
    signupValidator,
    activateValidator,
    signinValidator,
    logOutValidator,
    resetPasswordValidator,
    resetPasswordRequestValidator,
    refreshTokenValidator,
};