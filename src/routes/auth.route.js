const express = require('express');
const {
    signUpController,
    signInController,
    logOutController,
    activateUserController,
    resetPasswordRequestController,
    resetPasswordController, refreshTokenController
} = require("../controllers/auth.controller");
const {
    auth,
    refreshAuth,
} = require("../middleware/auth.middleware");
const {
    signupValidator,
    activateValidator,
    signinValidator,
    logOutValidator,
    resetPasswordValidator,
    resetPasswordRequestValidator,
    refreshTokenValidator,
} = require("../validators/auth.validator");

const router = express.Router();

//Route used to signup new users
router.post('/signup', signupValidator, signUpController);
//Route used to activate registered users
router.post('/activate', activateValidator, activateUserController);
//Route used to log in with email and password
router.get('/signin', signinValidator, signInController);
//Route used to log out of current session (technically blacklist current refresh token)
router.get('/logout', logOutValidator, auth, logOutController);
//Route used to request password resetting
router.post('/resetPassword', resetPasswordRequestValidator, resetPasswordRequestController);
//Route used to confirm password resetting
router.put('/resetPassword', resetPasswordValidator, resetPasswordController);
//Route used to refresh token
router.get('/refreshToken', refreshTokenValidator, refreshAuth, refreshTokenController);

module.exports = router;