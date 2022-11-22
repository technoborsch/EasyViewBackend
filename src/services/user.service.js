//const User = require('../models/user.model');

const returnSelfService = async (req) => {
    return {
        email: req.user.email,
        name: req.user.name,
        patronymic: req.user.patronymic,
        lastName: req.user.lastName,
        isAdmin: req.user.isAdmin,
        isModerator: req.user.isModerator,
    };
};

module.exports = { returnSelfService };