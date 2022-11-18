const express = require('express');
const {
    signUpController,
    signInController,
    resetPasswordRequestController,
    resetPasswordController, refreshTokenController
} = require("../controllers/auth.controller");
const router = express.Router();

router.post('/signup', signUpController);

router.post('/signin', signInController);

router.get('/resetPassword', resetPasswordRequestController);

router.post('/resetPassword', resetPasswordController);

router.get('/refreshToken', refreshTokenController);

module.exports = router;