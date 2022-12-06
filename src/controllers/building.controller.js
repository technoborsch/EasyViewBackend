const {
    getBuildingBySlug,
    getBuildingByID,
    createBuilding,
    editBuilding,
    deleteBuilding,
} = require('../services/building.service');

const getBuildingBySlugController = async (req, res, next) => {
    const username = req.params.username;
    const projectSlug = req.params.projectSlug;
    const buildingSlug = req.params.buildingSlug;
    const getBuildingBySlugService = await getBuildingBySlug(username, projectSlug, buildingSlug);
    return res.json(getBuildingBySlugService);
};
const getBuildingByIDController = async (req, res, next) => {
    const id = req.params.id;
    const getBuildingByIDService = await getBuildingByID(id);
    return res.json(getBuildingByIDService);
};
const createBuildingController = async (req, res, next) => {
    const data = req.body;
    const author = req.user.username;
    const createBuildingService = await createBuilding(author, data);
    return res.json(createBuildingService);
};
const editBuildingController = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const editBuildingService = await editBuilding(id, data);
    return res.json(editBuildingService);
};
const deleteBuildingController = async (req, res, next) => {
    const id = req.params.id;
    const deleteBuildingService = await deleteBuilding(id);
    return res.json(deleteBuildingService);
};

module.exports = {
    getBuildingBySlugController,
    getBuildingByIDController,
    createBuildingController,
    editBuildingController,
    deleteBuildingController,
};