const Project = require("../models/project.model");
const ReqError = require("../utils/ReqError");
const Building = require("../models/building.model");
const User = require('../models/user.model');
const buildingSerializer = require("../serializers/building.serializer");

const getBuildingBySlug = async (username, projectSlug, buildingSlug) => {
    const author = await User.findOne({username: username});
    const project = await Project.findOne({author: author._id, slug: projectSlug});
    if (!project || project.isPrivate) {
        throw new ReqError('There is no such project', 404);
    }
    const building = await Building.findOne({projectID: project._id, slug: buildingSlug});
    if (!building) {
        throw new ReqError('There is no such building', 404);
    }
    if (!project.buildings.includes(building._id)) {
        throw new ReqError('There is no such building in this project', 404);
    }
    return buildingSerializer(building);
    //TODO add as a project model method
};

const getBuildingByID = async (id) => {
    const building = await Building.findById(id);
    const project = await Project.findById(building.projectID);
    if (project.isPrivate || ! building) {
        throw new ReqError('There is no building with this ID', 404);
    }
    return buildingSerializer(building);
};

const createBuilding = async (authorID, data) => {
    const createdBuilding = new Building({...data, author: authorID});
    await createdBuilding.save();
    return buildingSerializer(createdBuilding); //TODO add logic to premium
};

const editBuilding = async (id, data) => {
    const buildingToEdit = await Building.findById(id);
    for (const attribute of Object.keys(data)) {
        buildingToEdit[attribute] = data[attribute];
    }
    await buildingToEdit.save();
    return buildingSerializer(buildingToEdit);
};

const deleteBuilding = async (id) => {
    await Building.findByIdAndDelete(id);
    return {success: true};
};

module.exports = {
    getBuildingBySlug,
    getBuildingByID,
    createBuilding,
    editBuilding,
    deleteBuilding,
};