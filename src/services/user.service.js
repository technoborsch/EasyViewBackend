//const User = require('../models/user.model');

const returnSelfService = async (req) => {
    return {
        email: req.user.email,
    };
};

module.exports = { returnSelfService };