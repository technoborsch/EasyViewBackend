const jwt = require('jsonwebtoken');
const User = require("../models/user.model");
const Token = require("../models/token.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const JWTSecret = process.env['JWT_SECRET'];
const bcryptSalt = process.env['BCRYPT_SALT'];
const clientURL = process.env['FRONTEND_URL'];

const signup = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (user) {
    throw new Error("Email already exist");
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

const signin = async (headers) => {
  const authString = headers['Authorization'];
  if (!authString) {
    throw new Error('Credentials were not provided');
  }
  const bearerString = authString.split(' ');
  if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Bearer') {
    throw new Error('Credentials were not provided');
  }
  const credentials = Buffer.from(bearerString[1], 'base64').toString('utf-8');
  const user = await User.findOne({email: credentials[0]});
  if (!user) {
    throw new Error('Wrong credentials');
  }
  const isPasswordValid = bcrypt.compare(credentials[1], user.password);
  if (!isPasswordValid) {
    throw new Error('Wrong credentials');
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

  if (!user) throw new Error("User does not exist");
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
    throw new Error("Invalid or expired password reset token");
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    throw new Error("Invalid or expired password reset token");
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

const refreshToken = async (headers) => {
  const authString = headers['Authorization'];
  if (!authString) {
    throw new Error('Credentials were not provided');
  }
  const bearerString = authString.split(' ');
  if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Bearer') {
    throw new Error('Credentials were not provided');
  }
  const decodedUser = await jwt.verify(bearerString[1], JWTSecret, {algorithm: 'HS512'});
  const user = await User.findOne({_id: decodedUser.id});
  if (!user) {
    throw new Error('There is no such user');
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