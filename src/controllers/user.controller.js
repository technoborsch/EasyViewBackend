const {
    returnSelfService,
    updateProfile,
    deleteProfile
} = require('../services/user.service');

/***
 * A controller to manage requests to get self profile URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const myProfileController = async (req, res, next) => {
    const user = await returnSelfService(req.user);
    return res.json(user);
};

/***
 * A controller to manage requests to profile update URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const updateProfileController = async (req, res, next) => {
    const updateProfileService = await updateProfile(req.body, req.user);
    return res.json(updateProfileService);
};

/***
 * A controller to manage requests to profile deletion URL
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns {Promise<Object>}
 */
const deleteProfileController = async (req, res, next) => {
    const deleteProfileService = await deleteProfile(req.user);
    return res.json(deleteProfileService);
};

module.exports = {
    myProfileController,
    updateProfileController,
    deleteProfileController
};