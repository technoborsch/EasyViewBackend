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

router.post('/signup', signupValidator, signUpController);
router.post('/activate', activateValidator, activateUserController);
router.post('/signin', signinValidator, signInController);
router.get('/resetPassword', resetPasswordRequestValidator, resetPasswordRequestController);
router.post('/resetPassword', resetPasswordValidator, resetPasswordController);
router.get('/refreshToken', auth, refreshTokenController);

module.exports = router;