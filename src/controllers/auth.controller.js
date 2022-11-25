const {
  signup,
  activate,
  signin,
  requestPasswordReset,
  resetPassword,
  refreshToken,
} = require('../services/auth.service');

/***
 * A controller to manage requests to signup URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const signUpController = async (req, res, next) => {
  const signupService = await signup(req.body);
  return res.json(signupService);
};

/***
 * A controller to manage requests to activate URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const activateUserController = async (req, res, next) => {
  const activateService = await activate(req.body);
  return res.json(activateService);
};

/***
 * A controller to manage requests to signin URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const signInController = async (req, res, next) => {
  const header = req.get('Authorization');
  const bearerString = header.split(' ');
  const credentials = Buffer.from(bearerString[1], 'base64').toString('utf-8').split(':');
  const email = credentials[0];
  const password = credentials[1];
  const signInService = await signin(email, password);
  return res.json(signInService);
};

/***
 * A controller to manage requests to reset password request URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const resetPasswordRequestController = async (req, res, next) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};

/***
 * A controller to manage requests to reset password URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await resetPassword(
    req.body.id,
    req.body.token,
    req.body.password,
  );
  return res.json(resetPasswordService);
};

/***
 * A controller to manage requests to refresh token URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const refreshTokenController = async (req, res, next) => {
  const refreshTokenService = await refreshToken(req.user._id);
  return res.json(refreshTokenService);
}

module.exports = {
  signUpController,
  activateUserController,
  signInController,
  resetPasswordRequestController,
  resetPasswordController,
  refreshTokenController,
};