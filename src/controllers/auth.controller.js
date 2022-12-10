const User = require("../models/user.model");
const ReqError = require("../utils/ReqError");
const Token = require("../models/token.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const redis = require("../utils/RedisClient");
const userSerializer = require("../serializers/user.serializer");

const JWTSecret = process.env['JWT_SECRET'];
const bcryptSalt = process.env['BCRYPT_SALT'];
const frontendUrl = process.env['FRONTEND_URL'];
const refreshJWTExpiry = process.env['REFRESH_JWT_EXPIRY']; //in days
const accessJWTExpiry = process.env['ACCESS_JWT_EXPIRY']; //in minutes

/***
 * A controller to manage requests to signup URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const signUpController = async (req, res) => {
  const data = req.body;
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
  return res.json({success: true});
};

/***
 * A controller to manage requests to activate URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const activateUserController = async (req, res) => {
  const data = req.body;
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
  return res.json({success: true});
};

/***
 * A controller to manage requests to signin URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const signInController = async (req, res) => {
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
  return res.json({
    user: userSerializer(user),
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

/**
 * A controller to manage logging out of current session
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const logOutController = async (req, res) => {
  const currentRefreshToken = await redis.getActualTokenOfUser(req.user._id);
  await redis.addTokenToBlackList(currentRefreshToken);
  await redis.addTokenToBlackList(req.token);
  return res.json({success: true});
};

/***
 * A controller to manage requests to reset password request URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const resetPasswordRequestController = async (req, res) => {

    //If there is no such user with this email or the user is inactive, reject request
  const user = await User.findOne({ email: req.body.email });
  if (!user || !user.isActive) throw new ReqError("User does not exist", 404);

  //If there is already token for this user, delete it
  let token = await Token.findOne({ userId: user._id, forReset: true });

  // Existing token created less than a minute ago
  if (token && Date.now() - token.createdAt < 60 * 1000 ) {
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
      user.email,
      'Password reset request',
      {
        name: user.name,
        link: link,
      },
      '../templates/passwordResetEmail.handlebar',
  );

  //Return success information
  return res.json({success: true});
};

/***
 * A controller to manage requests to reset password URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const resetPasswordController = async (req, res) => {

  //If there is no such token, reject request
  let passwordResetToken = await Token.findOne({ userId: req.body.id, forReset: true });
  if (!passwordResetToken) {
    throw new ReqError("Invalid, non-existent or expired password reset token", 401);
  }

  //If provided token doesn't match saved one, reject
  const isValid = await bcrypt.compare(req.body.token, passwordResetToken.token);
  if (!isValid) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }

  //If there is no such user, reject
  const user = await User.findById(req.body.id);
  if (!user || !user.isActive) {
    throw new ReqError("User does not exist", 404);
  }

  //Set new password to user and save
  user.password = req.body.password;
  await user.save();
  await passwordResetToken.deleteOne();

  //return info that it was successful
  return res.json({success: true});
};

/***
 * A controller to manage requests to refresh token URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const refreshTokenController = async (req, res) => {
  const accessToken = await jwt.sign(
      { id: req.user._id },
      JWTSecret,
      {expiresIn: accessJWTExpiry + 'm'}
  );
  const refreshToken = await jwt.sign(
      {id: req.user._id, refresh: true},
      JWTSecret,
      {expiresIn: refreshJWTExpiry + 'd'}
  );
  //Add old token to blacklist and assign token to user
  await redis.addTokenToBlackList(req.token);
  await redis.setTokenToUser(req.user._id, refreshToken);

  return res.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
};

module.exports = {
  signUpController,
  activateUserController,
  signInController,
  logOutController,
  resetPasswordRequestController,
  resetPasswordController,
  refreshTokenController,
};