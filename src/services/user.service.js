const {User} = require('../models/user.model')
const userView = require('../serializers/user.serializer')

/**
 * Returns trimmed info about given user
 *
 * @param {User} user User that has to be trimmed and returned
 * @returns {Promise<{userView}>} Promise with user information
 */
const returnSelfService = async (user) => {
    return userView(user);
};

/**
 * Service to update user profile
 *
 * @param {Object} data Data with information that has to be changed in given user's profile
 * @param {User} user User whose profile has to be changed
 * @returns {Promise<{userView}>} Promise with updated user's info
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
    if (data.patronymic) {
        user.patronymic = data.patronymic;
    }
    const updatedUser = await user.save();
    return userView(updatedUser);
};

/**
 * Service to delete user profile (actually just change it's isActive property)
 *
 * @param {User} user User that has to be deleted
 * @returns {Promise<{success: boolean}>} Promise with info whether deletion has been successful
 */
const deleteProfile = async(user) => {
    user.isActive = false;
    await user.save();
    return {success: true}
};

module.exports = {
    returnSelfService,
    updateProfile,
    deleteProfile
};