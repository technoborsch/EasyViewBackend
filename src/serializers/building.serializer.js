const buildingSerializer = (building) => ({
    id: building._id,
    name: building.name,
    description: building.description? building.description : null,
    slug: building.slug,
    projectID: building.projectID,
    author: building.author,
});

module.exports = buildingSerializer;