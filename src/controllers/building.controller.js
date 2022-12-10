const User = require("../models/user.model");
const Project = require("../models/project.model");
const ReqError = require("../utils/ReqError");
const Building = require("../models/building.model");
const buildingSerializer = require("../serializers/building.serializer");

const getBuildingBySlugController = async (req, res) => {
    const author = await User.findOne({username: req.params.username});
    const project = await Project.findOne({author: author._id, slug: req.params.projectSlug});
    if (!project || project.isPrivate) {
        throw new ReqError('There is no such project', 404);
    }
    const building = await Building.findOne({projectID: project._id, slug: req.params.buildingSlug});
    if (!building) {
        throw new ReqError('There is no such building', 404);
    }
    if (!project.buildings.includes(building._id)) {
        throw new ReqError('There is no such building in this project', 404);
    }
    //TODO add as a project model method
    return res.json(buildingSerializer(building));
};

const getBuildingByIDController = async (req, res) => {
    const building = await Building.findById(req.params.id);
    const project = await Project.findById(building.projectID);
    if (project.isPrivate || ! building) {
        throw new ReqError('There is no building with this ID', 404);
    }
    return res.json(buildingSerializer(building));
};

const createBuildingController = async (req, res) => {
    const createdBuilding = new Building({...req.body, author: req.user._id});
    await createdBuilding.save();
    //TODO add logic to premium
    return res.json(buildingSerializer(createdBuilding));
};

const editBuildingController = async (req, res) => {
    const buildingToEdit = await Building.findById(req.params.id);
    for (const attribute of Object.keys(req.body)) {
        buildingToEdit[attribute] = req.body[attribute];
    }
    await buildingToEdit.save();
    return res.json(buildingSerializer(buildingToEdit));
};

const deleteBuildingController = async (req, res) => {
    await Building.findByIdAndDelete(req.params.id);
    return res.json({success: true});
};

module.exports = {
    getBuildingBySlugController,
    getBuildingByIDController,
    createBuildingController,
    editBuildingController,
    deleteBuildingController,
};