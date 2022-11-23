const userSerializer = (user) => ({
    email: user.email,
    name: user.name,
    patronymic: user.patronymic,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
    isModerator: user.isModerator,
});

module.exports = userSerializer;