const buildingSerializer = (building) => ({
    id: building._id,
    name: building.name,
    description: building.description,
    slug: building.slug,
    projectID: building.projectID,
    author: building.author,
}); //TODO Change serializer accordingly

module.exports = buildingSerializer;