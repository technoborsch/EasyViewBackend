const express = require('express');

const {auth,} = require('../middleware/auth.middleware');
const {onlySelfAndModerators} = require('../middleware/author.middleware');

const {updateProfileValidator} = require('../validators/user.validator');
const {
    getUsersController,
    getUserByUsernameController,
    updateProfileController,
    deleteProfileController,
} = require('../controllers/user.controller');

const router = express.Router();

//Route used to get list of users
router.get('/user', auth, getUsersController);
//Route used to get user profile by username
router.get('/user/:username', getUserByUsernameController);
//Route used to update authorized user's profile
router.post('/user/:id', auth, onlySelfAndModerators, updateProfileValidator, updateProfileController);
//Route used to delete authorized user and all his objects
router.delete('/user', auth, onlySelfAndModerators, deleteProfileController);
//Just a little test route TODO remove later
router.get('/user/test/protected', auth, (req, res, next) => {return res.json({success: true})});

module.exports = router;