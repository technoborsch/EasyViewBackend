const projectSerializer = (project) => ({
    id: project._id,
    name: project.name,
    description: project.description,
    private: project.private,
    author: project.author,
    slug: project.slug,
}); //TODO change serializer accordingly

module.exports = projectSerializer;