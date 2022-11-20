const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ReqError = require('../utils/ReqError')

const JWTSecret = process.env['JWT_SECRET'];
const bcryptSalt = process.env['BCRYPT_SALT'];
const clientURL = process.env['FRONTEND_URL'];

const signup = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (user) {
    throw new ReqError("Email already exist", 409);
  }
  user = new User(data);
  const time = Date.now();
  const token = jwt.sign({ id: user._id }, JWTSecret, {expiresIn: '30d'});
  await user.save();
  return (data = {
    userId: user._id,
    email: user.email,
    name: user.name,
    token: token,
    expiry: time + 30 * 24 * 60 * 60 * 1000, // 5 minutes from now
  });
};

const signin = async (header) => {
  if (!header) {
    throw new ReqError('Credentials were not provided', 401);
  }
  const bearerString = header.split(' ');
  if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Bearer') {
    throw new ReqError('Credentials were not provided', 401);
  }
  const credentials = Buffer.from(bearerString[1], 'base64').toString('utf-8');
  const user = await User.findOne({email: credentials[0]});
  if (!user) {
    throw new ReqError('Wrong credentials', 401);
  }
  const isPasswordValid = bcrypt.compare(credentials[1], user.password);
  if (!isPasswordValid) {
    throw new ReqError('Wrong credentials', 401);
  }
  const time = Date.now();
  const token = jwt.sign({ id: user._id }, JWTSecret, {expiresIn: '30d'});
    return (data = {
    userId: user._id,
    email: user.email,
    name: user.name,
    token: token,
    expiry: time + 30 * 24 * 60 * 60 * 1000, // 5 minutes from now
  });

};

const requestPasswordReset = async (email) => {

  const user = await User.findOne({ email });

  if (!user) throw new ReqError("User does not exist", 404);
  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  //sendEmail(user.email,"Password Reset Request",{name: user.name,link: link,},"./template/requestResetPassword.handlebars");
  return `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
};

const resetPassword = async (userId, token, password) => {
  let passwordResetToken = await Token.findOne({ userId });
  if (!passwordResetToken) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new ReqError("Invalid or expired password reset token", 401);
  }
  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );
  //const user = await User.findById({ _id: userId });
  /*sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );*/
  await passwordResetToken.deleteOne();
  return true;
};

const refreshToken = async (header) => {
  if (!header) {
    throw new ReqError('Credentials were not provided', 401);
  }
  const bearerString = header.split(' ');
  if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Bearer') {
    throw new ReqError('Credentials were not provided', 401);
  }
  const decodedUser = await jwt.verify(bearerString[1], JWTSecret, {algorithm: 'HS512'});
  const user = await User.findOne({_id: decodedUser.id});
  if (!user) {
    throw new ReqError('There is no such user', 404);
  }
  return {
    token: await jwt.sign({id: user._id}, JWTSecret, {expiresIn: '1d'}),
    expiry: Date.now() + 24 * 60 * 60 * 1000,
  };
};

module.exports = {
  signup,
  signin,
  requestPasswordReset,
  resetPassword,
  refreshToken
}