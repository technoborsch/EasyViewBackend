const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const { myProfileController } = require('../controllers/user.controller')

router.get('/user/me', auth, myProfileController);