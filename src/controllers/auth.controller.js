const {
  signup,
  signin,
  requestPasswordReset,
  resetPassword,
  refreshToken,
} = require('../services/auth.service');

const signUpController = async (req, res, next) => {
  const signupService = await signup(req.body);
  return res.json(signupService);
};

const signInController = async (req, res, next) => {
  const signInService = await signin(req.get('Authorization'));
  return res.json(signInService);
}

const resetPasswordRequestController = async (req, res, next) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};

const resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  return res.json(resetPasswordService);
};

const refreshTokenController = async (req, res, next) => {
  const refreshTokenService = await refreshToken(req.get('Authorization'));
  return res.json(refreshTokenService);
}

module.exports = {
  signUpController,
  signInController,
  resetPasswordRequestController,
  resetPasswordController,
  refreshTokenController,
};