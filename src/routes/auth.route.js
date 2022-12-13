const express = require('express');
const {
    auth,
    refreshAuth,
    signInAuth,
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
const User = require("../models/user.model");

const router = express.Router();

//Route used to signup new users
router.post(
    '/signup',
    signupValidator,
    async (req, res) => {
        return res.json(await User._signUp(req.body));
    }
);
//Route used to activate registered users
router.post(
    '/activate',
    activateValidator,
    async (req, res) => {
        return res.json(await User._activate(req.body));
    }
);
//Route used to log in with email and password
router.get(
    '/signin',
    signInAuth,
    signinValidator,
    async (req, res) => {
        return res.json(await User._signIn(req.user));
    }
);
//Route used to log out of current session (technically blacklist current refresh token)
router.get(
    '/logout',
    auth,
    logOutValidator,
    async (req, res) => {
        return res.json(await User._logOut(req.user, req.token));
    }
);
//Route used to request password resetting
router.post(
    '/resetPassword',
    resetPasswordRequestValidator,
    async (req, res) => {
        return res.json(await User._requestPasswordReset(req.body));
    }
);
//Route used to confirm password resetting
router.put(
    '/resetPassword',
    resetPasswordValidator,
    async (req, res) => {
        return res.json(await User._resetPassword(req.body));
    }
);
//Route used to refresh token
router.get(
    '/refreshToken',
    refreshTokenValidator,
    refreshAuth,
    async (req, res) => {
        return res.json(await User._refreshToken(req.user, req.token));
    }
);

module.exports = router;