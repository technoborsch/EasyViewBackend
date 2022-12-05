const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const ReqError = require('../utils/ReqError');
const userSerializer = require('../serializers/user.serializer');
const sendEmail = require('../utils/sendEmail');
const redis = require('../utils/RedisClient');

const JWTSecret = process.env['JWT_SECRET'];
const bcryptSalt = process.env['BCRYPT_SALT'];
const frontendUrl = process.env['FRONTEND_URL'];
const refreshJWTExpiry = process.env['REFRESH_JWT_EXPIRY']; //in days
const accessJWTExpiry = process.env['ACCESS_JWT_EXPIRY']; //in minutes

/**
 * A service used to sign up a user with given data
 *
 * @param {Object<{email: string, username: string, password: string}>} data Object that contains email, username and password fields
 * @returns {Object<{success: Boolean}>} Object that informs that registration was successful.
 */
const signup = async (data) => {
  let user = await User.findOne({ email: data.email});
  //If there is already a user with this email and is active, reject registration
  if (user && user.isActive) {
    throw new ReqError('Email already exist', 409);
  }
  // If there is already a user with this username but with different email, reject registration
  let userWithSameUsername = await User.findOne({username: data.username});
  if (userWithSameUsername && userWithSameUsername.email !== data.email) {
    throw new ReqError('This username is already in use', 409);
  }
  if (!user) { //Then create one
    user = new User(data); //Potentially dangerous, very strict validation of data must be performed
    await user.save();
  } else { //Then it means that we have not active existing user that probably already had a token
    //If there is already a token for this user issued less than a minute ago, reject request
    let token = await Token.findOne({ userId: user._id, forReset: false });
    if (token && Date.now() - token.createdAt < 60 * 1000) { // a minute
      throw new ReqError('You already have a registration token issued less than a minute ago, please use it or try again later', 409);
    }
  }
  //Create a token with this user id and random activation string, encrypted with bcrypt
  let activateToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(activateToken, Number(bcryptSalt));
  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();
  //Create confirmation link and send email to registered user
  const link = frontendUrl + '/confirm_email' + '?' + `token=${activateToken}` + '&' + `id=${user._id}`;
  await sendEmail(
      data.email,
      'Easyview registration',
      {
        link: link,
      },
      '../templates/registrationEmail.handlebar',
      );
  //Return success info
  return {success: true};
};

/**
 * Service to activate created user's account.
 *
 * @param {Object<{id: string, token: string}>} data Object that contains user id that has to be activated and token
 * that was given during activation
 * @returns {Promise<{success: boolean}>} Promise that contains information about whether activation was successful
 */
const activate = async (data) => {
  const activationToken = await Token.findOne({userId: data.id, forReset: false});
  //If there is no such token or the token is for another user, reject request
  if (!activationToken) throw new ReqError('Invalid or expired activation token', 401);
  const isValid = await bcrypt.compare(data.token, activationToken.token);
  if (!isValid) throw new ReqError('Invalid or expired activation token', 401);
  const user = await User.findById(data.id);
  //If there is no such user in database for some reason, reject request
  if (!user) throw new ReqError('No such user', 404);
  user.isActive = true;
  await user.save();
  return { success: true };
};

/**
 * Login service, used to check if credentials are valid and, if they are, return information about user and
 * access/refresh token pair
 *
 * @param {string} emailOrUsername User email or username, it will accept both
 * @param {string} password User password
 * @returns {Promise<{
 * user: {
 * lastName,
 * isModerator,
 * name,
 * id,
 * username,
 * isAdmin,
 * isPremium,
 * about,
 * organization,
 * email},
 * accessToken: string,
 * refreshToken: string}>}
 */
const signin = async (emailOrUsername, password) => {
  //If there is no such user in database or the user is inactive, reject
  let user = await User.findOne({email: emailOrUsername});
  if (!user) {
    user = await User.findOne({username: emailOrUsername});
  }
  if (!user || !user.isActive) {
    throw new ReqError('Wrong email or password', 401);
  }
  //If passwords don't match, reject request
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ReqError('Wrong email or password', 401);
  }
  //Create new token pair that expires in set time
  const accessToken = await jwt.sign(
      { id: user._id },
      JWTSecret,
      {expiresIn: accessJWTExpiry + 'm'}
  );
  const refreshToken = await jwt.sign(
      {id: user._id, refresh: true},
      JWTSecret,
      {expiresIn: refreshJWTExpiry + 'd'}
  );
  //If exists, blacklist previous refresh token
  const previousRefreshToken = await redis.getActualTokenOfUser(user._id);
  if (previousRefreshToken) {
    await redis.addTokenToBlackList(previousRefreshToken);
  }
  //Set this refresh token as current for this user in redis
  await redis.setTokenToUser(user._id, refreshToken);
  //Return data about authorized user, created access and refresh tokens
  return {
    user: userSerializer(user),
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

/**
 * Log out service, blacklists user's current tokens
 *
 * @param {string} userId User that logs out
 * @param {string} accessToken User's current access token
 * @returns {Promise<Object<{success: boolean}>>} Promise with message that logout was successful
 */
const logOut = async (userId, accessToken) => {
  const currentRefreshToken = await redis.getActualTokenOfUser(userId);
  await redis.addTokenToBlackList(currentRefreshToken);
  await redis.addTokenToBlackList(accessToken);
  return {success: true}
};

/**
 * Service to process password reset requests
 *
 * @param {string} email Email of user whose password should be reset
 * @returns {Object<{success: Boolean}>} Promise that fulfills with info of user's id and token to reset password
 */
const requestPasswordReset = async (email) => {
  //If there is no such user with this email or the user is inactive, reject request
  const user = await User.findOne({ email: email });
  if (!user || !user.isActive) throw new ReqError("User does not exist", 404);
  //If there is already token for this user, delete it
  let token = await Token.findOne({ userId: user._id, forReset: true });
  if (token && Date.now() - token.createdAt < 60 * 1000 ) { // Existing token created less than a minute ago
    throw new ReqError('You have already requested password reset earlier, try again later', 409);
  }
  //Create new token
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
    forReset: true,
  }).save();
  //Generate link to change password and send message to user's email
  const link = frontendUrl + '/reset_password' + '?' + `token=${resetToken}` + '&' + `id=${user._id}`
  await sendEmail(
      email,
      'Password reset request',
      {
        name: user.name,
        link: link,
      },
      '../templates/passwordResetEmail.handlebar',
  );
  //Return success information
  return {success: true};
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
  let passwordResetToken = await Token.findOne({ userId: userId, forReset: true });
  if (!passwordResetToken) {
    throw new ReqError("Invalid, non-existent or expired password reset token", 401);
  }
  //If provided token doesn't match saved one, reject
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }
  //If there is no such user, reject
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ReqError("User does not exist", 404);
  }
  //Set new password to user and save
  user.password = password;
  await user.save();
  await passwordResetToken.deleteOne();
  //return info that it was successful
  return {success: true};
};

/**
 * Service to get new access tokens
 *
 * @param {string} userId User for whom a token must be issued
 * @param {string} previousRefreshToken Token that is being used
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Promise with token pair
 */
const refreshToken = async (userId, previousRefreshToken) => {
  const accessToken = await jwt.sign(
      { id: userId },
      JWTSecret,
      {expiresIn: accessJWTExpiry + 'm'}
  );
  const refreshToken = await jwt.sign(
      {id: userId, refresh: true},
      JWTSecret,
      {expiresIn: refreshJWTExpiry + 'd'}
  );
  //Add old token to blacklist and assign token to user
  await redis.addTokenToBlackList(previousRefreshToken);
  await redis.setTokenToUser(userId, refreshToken);
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

module.exports = {
  signup,
  activate,
  signin,
  logOut,
  requestPasswordReset,
  resetPassword,
  refreshToken
};