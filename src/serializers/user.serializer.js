const userSerializer = (user) => ({
    email: user.email,
    username: user.username,
    name: user.name,
    lastName: user.lastName,
    organization: user.organization,
    about: user.about,
    isAdmin: user.isAdmin,
    isModerator: user.isModerator,
    isPremium: user.isPremium,
});

module.exports = userSerializer;