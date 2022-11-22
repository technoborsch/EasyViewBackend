const express = require('express');
const router = express.Router();

const {auth} = require('../middleware/auth.middleware');
const {
    updateProfileValidator,
} = require('../validators/user.validator');
const {
    myProfileController,
    updateProfileController,
    deleteProfileController,
} = require('../controllers/user.controller')

router.get('/user', auth, myProfileController);
router.post('/user', auth, updateProfileValidator, updateProfileController);
router.delete('/user', auth, deleteProfileController);

module.exports = router;