
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

const updateProfile = async (req) => {
    const data = req.body;
    const user = req.user;
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
    return {
        email: updatedUser.email,
        name: updatedUser.name,
        patronymic: updatedUser.patronymic,
        lastName: updatedUser.lastName,
        isAdmin: updatedUser.isAdmin,
        isModerator: updatedUser.isModerator,
    };
};

const deleteProfile = async(user) => {
    user.isActive = false;
    await user.save();
    return {success: true}
};

module.exports = { returnSelfService, updateProfile, deleteProfile };