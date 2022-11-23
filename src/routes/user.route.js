const express = require('express');

const {auth} = require('../middleware/auth.middleware');
const {updateProfileValidator} = require('../validators/user.validator');
const {
    myProfileController,
    updateProfileController,
    deleteProfileController,
} = require('../controllers/user.controller');

const router = express.Router();

//Route used to get profile of currently authorized user
router.get('/user', auth, myProfileController);
//Route used to update user's profile
router.post('/user', auth, updateProfileValidator, updateProfileController);
//Route used to delete user (actually user isn't deleted from database)
router.delete('/user', auth, deleteProfileController);

module.exports = router;