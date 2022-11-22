const { returnSelfService } = require('../services/user.service');

const myProfileController = async (req, res, next) => {
    const user = await returnSelfService(req);
    return res.json(user);
};

module.exports = { myProfileController };