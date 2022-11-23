const express = require('express');
const {
    signUpController,
    signInController,
    activateUserController,
    resetPasswordRequestController,
    resetPasswordController, refreshTokenController
} = require("../controllers/auth.controller");
const {auth} = require("../middleware/auth.middleware");
const {
    signupValidator,
    activateValidator,
    signinValidator,
    resetPasswordValidator,
    resetPasswordRequestValidator,
} = require("../validators/auth.validator");

const router = express.Router();

//Route used to signup new users
router.post('/signup', signupValidator, signUpController);
//Route used to activate registered users
router.post('/activate', activateValidator, activateUserController);
//Route used to log in with email and password
router.post('/signin', signinValidator, signInController);
//Route used to request password resetting
router.get('/resetPassword', resetPasswordRequestValidator, resetPasswordRequestController);
//Route used to confirm password resetting
router.post('/resetPassword', resetPasswordValidator, resetPasswordController);
//Route used to refresh token
router.get('/refreshToken', auth, refreshTokenController);

module.exports = router;