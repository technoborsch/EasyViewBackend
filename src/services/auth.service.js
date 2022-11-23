const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ReqError = require('../utils/ReqError');
const userView = require('../serializers/user.serializer')

const JWTSecret = process.env['JWT_SECRET'];
const bcryptSalt = process.env['BCRYPT_SALT'];

/**
 * A service used to sign up a user with given data
 *
 * @param {Object<{email: string}>} data Object that contains email field
 * @returns {Promise<{userId:string, token: string}>} Promise that fulfils with registered used ID and activation token
 */
const signup = async (data) => {
  let user = await User.findOne({ email: data.email});
  //If there is already a user with this email and is active, reject registration
  if (user && user.isActive) {
    throw new ReqError("Email already exist", 409);
  }
  user = new User(data); //Potentially dangerous, very strict validation of data must be performed
  await user.save();
  //If there is already a token for this user, delete it
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  //Create a token with this user id and random activation string, encrypted with bcrypt
  let activateToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(activateToken, Number(bcryptSalt));
  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();
  //Return created user id and activation token
  return {
    userId: user._id,
    token: activateToken,
  };
};

/**
 * Service to activate created user's account.
 *
 * @param {Object<{id: string, token: string}>} data Object that contains user id that has to be activated and token
 * that was given during activation
 * @returns {Promise<{success: boolean}>} Promise that contains information about whether activation was successful
 */
const activate = async (data) => {
  const activationToken = await Token.findOne({userId: data.id});
  //If there is no such token or it is for another user, reject request
  if (!activationToken) throw new ReqError('Invalid or expired activation token', 401);
  const isValid = bcrypt.compare(data.token, activationToken.token);
  if (!isValid) throw new ReqError('Invalid or expired activation token', 401);
  const user = await User.findById(data.id);
  //If there is no such user in database for some reason, reject request
  if (!user) throw new ReqError('No such user', 404);
  //Apply and save provided information to this user
  user.password = data.password;
  user.name = data.name;
  user.patronymic = data.patronymic;
  user.lastName = data.lastName;
  user.isActive = true;
  await user.save();
  return { success: true };
};

/**
 * Login service, used to check if credentials are valid and, if they are, return information about user and access token
 *
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<{expiry: number, user: {lastName, patronymic, isModerator, name, id, isAdmin, email}, token: (*)}>}
 */
const signin = async (email, password) => {
  //If there is no such user in database or the user is inactive, reject
  const user = await User.findOne({email: email});
  if (!user || !user.isActive) {
    throw new ReqError('Wrong email or password', 401);
  }
  //If passwords don't match, reject request
  const isPasswordValid = bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ReqError('Wrong email or password', 401);
  }
  //Create new token that expires in some time
  const time = Date.now();
  const token = jwt.sign({ id: user._id }, JWTSecret, {expiresIn: '30d'}); //TODO move to environmental variables
  //Return data about authorized user, created access token and information when it will be expired
  return {
    user: userView(user),
    token: token,
    expiry: time + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  };

};

/**
 * Service to process password reset requests
 *
 * @param {string} email Email of user whose password should be reset
 * @returns {Promise<{userId: string, token: string}>} Promise that fulfills with info of user's id and token to reset password
 */
const requestPasswordReset = async (email) => {
  //If there is no such user or the user is inactive, reject request
  const user = await User.findOne({ email });
  if (!user || !user.isActive) throw new ReqError("User does not exist", 404);
  //If there is already token for this user, delete it
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  //Create new token
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();
  //Return user id and token
  return {userId: user._id, token: resetToken};
};

/**
 * Service to perform password resetting of a user
 *
 * @param {string} userId Id of user whose password should be reset
 * @param {string} token Password resetting token
 * @param {string} password New password
 * @returns {Promise<{success: boolean}>} Promise that fulfills with info whether resetting was successful
 */
const resetPassword = async (userId, token, password) => {
  //If there is no such token, reject request
  let passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }
  //If provided token doesn't match saved one, reject
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }
  //Hash new password
  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  //If there is no such user, reject
  const user = User.findById(userId);
  if (!user || !user.isActive) {
    throw new ReqError("User does not exist", 404);
  }
  //Set new password to user and save
  user.password = hash;
  await user.save();
  await passwordResetToken.deleteOne();
  //return info that it was successful
  return {success: true};
};

/**
 * Service to get new access tokens
 *
 * @param {string} userId User for whom a token must be issued
 * @returns {Promise<{expiry: number, token: string}>} Promise with token and it's expiration information
 */
const refreshToken = async (userId) => {
  return {
    token: await jwt.sign({id: userId}, JWTSecret, {expiresIn: '1d'}),
    expiry: Date.now() + 24 * 60 * 60 * 1000,
  };
};

module.exports = {
  signup,
  activate,
  signin,
  requestPasswordReset,
  resetPassword,
  refreshToken
}