const jwt = require('jsonwebtoken');
const User = require('../models/user.model')
const ReqError = require("../utils/ReqError");

const JWTSecret = process.env['JWT_SECRET'];

const authMiddleware = async (req, res, next) => {
    const authString = req.get('Authorization');
    if (!authString) {
        throw new ReqError('Credentials were not provided', 401);
    }
    const bearerString = authString.split(' ');
    if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Token') {
        throw new ReqError('Credentials were not provided', 401);
    }
    let isValid;
    try {
        isValid = jwt.verify(bearerString[1], JWTSecret, {algorithm: 'HS512'});
    } catch (err) {
        throw new ReqError('Corrupted token', 401);
    }
    if (!isValid) {
        throw new ReqError('Wrong credentials, access denied', 401);
    }
    let decoded;
    try {
        decoded = jwt.decode(bearerString[1]);
    } catch (err) {
        throw new ReqError('Corrupted token', 401);
    }
    const user = await User.findOne({_id: decoded.id});
    if (!user || !user.isActive) {
        throw new ReqError('Trying to access data as non-existent user', 401);
    }
    req.user = user;
    next();
}

module.exports = { auth: authMiddleware }