const Project = require("../models/project.model");
const ReqError = require("../utils/ReqError");
const Building = require("../models/building.model");
const buildingSerializer = require("../serializers/building.serializer");

const getBuildingBySlug = async (username, projectSlug, buildingSlug) => {
    const project = await Project.findOne({author: username, slug: projectSlug});
    if (!project || project.isPrivate) {
        throw new ReqError('There is no such project', 404);
    }
    if (!project.buildings.includes(buildingSlug)) {
        throw new ReqError('There is no such building in this project', 404);
    }
    const building = await Building.findOne({projectID: project._id, slug: buildingSlug});
    if (!building) {
        throw new ReqError('There is no such building', 404);
    }
    return buildingSerializer(building);
};

const getBuildingByID = async (id) => {
    const building = await Building.findById(id);
    const project = await Project.findById(building.projectID);
    if (project.isPrivate) {
        throw new ReqError('There is no building with this ID', 404);
    }
    if (!building) {
        throw new ReqError('There is no building with this ID', 404);
    }
    return buildingSerializer(building);
};

const createBuilding = async (author, data) => {
    const project = await Project.findById(data.projectID);
    if (project.buildings.includes(data.slug)) {
        throw new ReqError('This project already has a building with same slug, please set another slug', 409);
    }
    for (const buildingSlug of project.buildings) {
        const building = await Building.findOne({projectID: project._id, slug: buildingSlug});
        if (building.name === data.name) {
            throw new ReqError('This project already has a building with same name, please set another name', 409);
        }
    }
    const createdBuilding = new Building({...data, author: author});
    await createdBuilding.save();
    project.buildings.push(createdBuilding.slug);
    await project.save();
    return buildingSerializer(createdBuilding); //TODO add logic to premium
};

const editBuilding = async (id, data) => {
    const buildingToEdit = await Building.findById(id);
    const buildingProject = await Project.findById(buildingToEdit.projectID);
    if (data.slug && buildingProject.buildings.includes(data.slug)) {
        throw new ReqError('There is already a building with same slug in this project', 409);
    }
    if (data.slug) {
        const buildings = buildingProject.buildings;
        const oldSlug = buildingToEdit.slug;
        const index = buildings.indexOf(oldSlug);
        buildings[index] = data.slug;
        buildingProject.buildings = buildings;
        await buildingProject.save();
    }
    await buildingToEdit.updateOne(data);
    return buildingSerializer(await Building.findById(buildingToEdit.id));
};

const deleteBuilding = async (id) => {
    const buildingToDelete = await Building.findById(id);
    const project = await Project.findById(buildingToDelete.projectID);
    if (!buildingToDelete) {
        throw new ReqError('There is no such building', 404);
    }
    project.buildings.splice(project.buildings.indexOf(buildingToDelete.slug), 1);
    await buildingToDelete.deleteOne();
    await project.save();
    return {success: true};
};

module.exports = {
    getBuildingBySlug,
    getBuildingByID,
    createBuilding,
    editBuilding,
    deleteBuilding,
};