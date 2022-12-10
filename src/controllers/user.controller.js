const User = require("../models/user.model");
const userSerializer = require("../serializers/user.serializer");
const ReqError = require("../utils/ReqError");

/***
 * A controller to manage requests to get self profile URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const getUsersController = async (req, res) => {
    const activeUsers = await User.find({isActive: true});
    const serializedActiveUsers = [];
    for (const user of activeUsers) {
        serializedActiveUsers.push(userSerializer(user));
    }
    return res.json(serializedActiveUsers);
};

const getUserByUsernameController = async (req, res) => {
    const user = await User.findOne({username: req.params.username});
    if (!user || !user.isActive) {
        throw new ReqError('There is no such user', 404);
    }
    return res.json(userSerializer(user));
};

/***
 * A controller to manage requests to profile update URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const updateProfileController = async (req, res) => {
    const data = req.body;
    const user = req.user;
    for (const attribute of Object.keys(data)) {
        user[attribute] = data[attribute];
    }
    await user.save();
    return res.json(userSerializer(user));
};

/***
 * A controller to manage requests to profile deletion URL
 *
 * @param req Request object
 * @param res Response object
 * @returns {Promise<Object>}
 */
const deleteProfileController = async (req, res) => {
    await User.deleteOne({_id: req.user._id});
    return res.json({success: true});
};

module.exports = {
    getUsersController,
    getUserByUsernameController,
    updateProfileController,
    deleteProfileController
};