const express = require('express');

const {
    auth,
    optionalAuth,
} = require('../middleware/auth.middleware');
const {
    getUserByUsernameValidator,
    getUserByIDValidator,
    updateProfileValidator,
    deleteProfileValidator,
} = require('../validators/user.validator');
const User = require("../models/user.model");

const router = express.Router();

//Route used to get list of users
router.get(
    '/user',
    optionalAuth,
    async (req, res) => {
        return res.json(await User._getList(req.user));
    }
);

//Route used to get user profile by username
router.get(
    '/user/username/:username',
    optionalAuth,
    getUserByUsernameValidator,
    async (req, res) => {
        return res.json(await User._getByUsername(req.user, req.params.username));
    }
);

//Route used to get user profile by username
router.get(
    '/user/:id',
    optionalAuth,
    getUserByIDValidator,
    async (req, res) => {
        return res.json(await User._getByID(req.user, req.params.id));
    }
);

//Route used to update user's profile
router.post(
    '/user/:id',
    auth,
    updateProfileValidator,
    async (req, res) => {
        return res.json(await User._updateProfile(req.user, req.params.id, req.body));
    }
);

//Route used to delete user by ID or authorized user if without ID
router.delete(
    ['/user/:id', '/user'],
    auth,
    deleteProfileValidator,
    async (req, res) => {
        return res.json(await User._deleteProfile(req.user, req.params.id));
    }
);

//Just a little test route TODO remove later
router.get(
    '/user/test/protected',
    auth,
    (req, res, next) => {
        return res.json({success: true})
    });

module.exports = router;