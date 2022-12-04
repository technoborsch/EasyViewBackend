const User = require('../models/user.model');
const Token = require('../models/token.model');
const userSerializer = require('../serializers/user.serializer');

/**
 * Returns trimmed info about given user
 *
 * @param {User} user User that has to be trimmed and returned
 * @returns {Promise<{userSerializer}>} Promise with user information
 */
const returnSelfService = async (user) => {
    return userSerializer(user);
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
    user.isActive = false;
    await user.save();
    //Delete all issued tokens
    await Token.deleteMany({userId: user._id});
    return {success: true}
};

module.exports = {
    returnSelfService,
    getUserByUsername,
    updateProfile,
    deleteProfile
};