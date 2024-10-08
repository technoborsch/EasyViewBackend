const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
const ReqError = require("../utils/ReqError");
const fv = require("../validators/auth/auth.fields");
const redis = require('../utils/RedisClient');
const bcrypt = require("bcrypt");

const JWTSecret = process.env['JWT_SECRET'];

/***
 * Authentication middleware that checks if correct authorization information has been provided, user exists and active
 * and attaches authorized user to request.
 *
 * @param req Request that should be authorized
 * @param res Response object
 * @param next Next function
 * @returns {Promise<void>} Void promise because async function
 */
const authMiddleware = async (req, res, next) => {
    const info = await checkAndDecodeAttachedToken(req);
    const decoded = info.decoded;
    const token = info.token;
    const blacklisted = await redis.getBlacklistedToken(token);
    if (blacklisted) {
        throw new ReqError('This token has been blacklisted, please refresh or login', 401);
    }
    if (decoded.hasOwnProperty('refresh')) {
        throw new ReqError('You have attached a refresh token, please provide valid access token instead', 400);
    }
    req.user = await checkIfUserExists(decoded.id);
    req.token = token;
    next();
};

const optionalAuth = async (req, res, next) => {
    if (req.get('Authorization')) {
        return authMiddleware(req, res, next);
    } else {
        next();
    }
};

const signInAuth = async (req, res, next) => {
    const header = req.get('Authorization');
    const bearerString = header.split(' ');
    const credentials = Buffer.from(bearerString[1], 'base64').toString('utf-8').split(':');
    const emailOrUsername = credentials[0];
    const password = credentials[1];

    let user = await User.findOne({email: emailOrUsername});
    if (!user) {
        user = await User.findOne({username: emailOrUsername});
    }
    if (!user || !user.isActive) {
        throw new ReqError('Wrong login-password pair', 401);
    }
    //If passwords don't match, reject request
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ReqError('Wrong login-password pair', 401);
    }
    req.user = user;
    next();
};

/***
 * Authentication middleware that checks if correct refresh token has been provided, user exists and active
 * and attaches authorized user and used refresh token to request.
 *
 * @param req Request that should be authorized
 * @param res Response object
 * @param next Next function
 * @returns {Promise<void>} Void promise because async function
 */
const refreshAuthMiddleware = async (req, res, next) => {
    const info = await checkAndDecodeAttachedToken(req);
    const decoded = info.decoded;
    const token = info.token;
    const blacklisted = await redis.getBlacklistedToken(token);
    if (blacklisted) {
        throw new ReqError('This token has already been used, you need another one', 401);
    }
    if (!decoded.hasOwnProperty('refresh')) {
        throw new ReqError('You have attached an access token, please provide valid refresh token instead', 400);
    }
    req.user = await checkIfUserExists(decoded.id);
    req.token = token;
    next();
};

/**
 * Function used to validate if correct auth headers were provided in request to protected route
 *
 * @param req Request object
 * @returns {Promise<{decoded: ({payload: *, signature: *, header: *}|*), token: string}>} Promise with decoded token
 * info and token itself
 */
const checkAndDecodeAttachedToken = async (req) => {
    const authString = req.get('Authorization');
    if (!authString) throw new ReqError('Credentials were not provided', 401);
    if (!fv.tokenHeader(authString)) {
        throw new ReqError('Wrong credentials - "Authorization" header must contain information in format "Token" +' +
            '" " + "{valid JWT token}. Check this header"', 401);
    }
    let isValid;
    const JWT = authString.split(" ")[1];
    try {
        isValid = await jwt.verify(JWT, JWTSecret, {algorithm: 'HS512'});
    } catch (err) {
        throw new ReqError('Corrupted token', 401);
    }
    if (!isValid) {
        throw new ReqError('Wrong credentials, access denied', 401);
    }
    let decoded;
    try {
        decoded = await jwt.decode(JWT, {algorithm: 'HS512'});
    } catch (err) {
        throw new ReqError('Corrupted token', 401);
    }
    return { decoded: decoded, token: JWT };
};

/**
 * Checks if user exists and active, returns user if he does and throws an error if he doesn't
 *
 * @param {string} userId User whose existence in database should be checked
 * @returns {Promise<Object>} Promise with user if he exists
 */
const checkIfUserExists = async (userId) => {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ReqError('Trying to access data as non-existent user', 401);
    }
    return user;
};

module.exports = {
    auth: authMiddleware,
    optionalAuth,
    refreshAuth: refreshAuthMiddleware,
    signInAuth,
};