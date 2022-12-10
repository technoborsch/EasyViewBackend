const User = require('../models/user.model');
const userSerializer = require('../serializers/user.serializer');
const ReqError = require("../utils/ReqError");

/**
 * Returns list of trimmed active users
 *
 * @returns {Promise<[{userSerializer}]>} Promise with list of active users
 */
const getUsers = async () => {
    const activeUsers = await User.find({isActive: true});
    const serializedActiveUsers = [];
    for (const user of activeUsers) {
        serializedActiveUsers.push(userSerializer(user));
    }
    return serializedActiveUsers;
};

const getUserByUsername = async (username) => {
    const user = await User.findOne({username: username});
    if (!user || !user.isActive) {
        throw new ReqError('There is no such user', 404);
    }
    return userSerializer(user);
};

/**
 * Service to update user profile
 *
 * @param {Object} data Data with information that has to be changed in given user's profile
 * @param {User} user User whose profile has to be changed
 * @returns {Promise<{userSerializer}>} Promise with updated user's info
 */
const updateProfile = async (data, user) => {
    for (const attribute of Object.keys(data)) {
        user[attribute] = data[attribute];
    }
    await user.save();
    return userSerializer(user);
};

/**
 * Service to delete user profile.
 *
 * @param {User} user User that has to be deleted
 * @returns {Promise<{success: boolean}>} Promise with info whether deletion has been successful
 */
const deleteProfile = async(user) => {
    await User.deleteOne({_id: user._id});
    return {success: true}
};

module.exports = {
    getUsers,
    getUserByUsername,
    updateProfile,
    deleteProfile
};