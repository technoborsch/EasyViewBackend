const { returnSelfService, updateProfile, deleteProfile } = require('../services/user.service');

const myProfileController = async (req, res, next) => {
    const user = await returnSelfService(req);
    return res.json(user);
};

const updateProfileController = async (req, res, next) => {
    const updateProfileService = await updateProfile(req);
    return res.json(updateProfileService);
};

const deleteProfileController = async (req, res, next) => {
    const deleteProfileService = await deleteProfile(req.user);
    return res.json(deleteProfileService);
};

module.exports = { myProfileController, updateProfileController, deleteProfileController };