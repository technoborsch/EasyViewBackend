const userSerializer = (user) => ({
    id: user._id,
    email: user.email,
    username: user.username,
    name: user.name? user.name : null,
    lastName: user.lastName? user.lastName : null,
    organization: user.organization? user.organization : null,
    about: user.about? user.about : null,
    isAdmin: user.isAdmin,
    isModerator: user.isModerator,
    isPremium: user.isPremium,
    projects: user.projects,
    buildings: user.buildings,
    participatesIn: user.participatesIn,
    visibility: user.visibility,
});

module.exports = userSerializer;