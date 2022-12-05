const User = require('../models/user.model');
const Token = require('../models/token.model');
const userSerializer = require('../serializers/user.serializer');
const ReqError = require("../utils/ReqError");
const Project = require("../models/project.model");

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
    if (!user) {
        throw new ReqError('There is no such user', 404);
    }
    return userSerializer(user);
}

/**
 * Service to update user profile
 *
 * @param {Object} data Data with information that has to be changed in given user's profile
 * @param {User} user User whose profile has to be changed
 * @returns {Promise<{userSerializer}>} Promise with updated user's info
 */
const updateProfile = async (data, user) => {
    if (data.password) {
        user.password = data.password;
    }
    if (data.name) {
        user.name = data.name;
    }
    if (data.lastName) {
        user.lastName = data.lastName;
    }
    if (data.about) {
        user.about = data.about;
    }
    if (data.organization) {
        user.organization = data.organization;
    }
    const updatedUser = await user.save();
    return userSerializer(updatedUser);
};

/**
 * Service to delete user profile (actually just change its isActive property)
 *
 * @param {User} user User that has to be deleted
 * @returns {Promise<{success: boolean}>} Promise with info whether deletion has been successful
 */
const deleteProfile = async(user) => {
    //No logic to check if user exists and is active because it has been already checked during authentication
    await User.findByIdAndDelete(user._id);
    //Delete all related objects
    await Token.deleteMany({userId: user._id});
    await Project.deleteMany({author: user.username});
    return {success: true}
};

module.exports = {
    getUsers,
    getUserByUsername,
    updateProfile,
    deleteProfile
};