const projectSerializer = (project) => ({
    id: project._id,
    name: project.name,
    description: project.description? project.description : null,
    private: project.private,
    participants: project.participants,
    buildings: project.buildings,
    author: project.author,
    slug: project.slug,
});

module.exports = projectSerializer;