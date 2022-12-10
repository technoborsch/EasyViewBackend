const Project = require('../models/project.model');
const projectSerializer = require('../serializers/project.serializer');

const ReqError = require("../utils/ReqError");

const getAllProjects = async () => {
    const projects = await Project.find({private: false});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return serializedProjects;
};

const getAllMyProjects = async (userID) => {
    const projects = await Project.find({author: userID});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return serializedProjects;
};

const getProjectByID = async (userID, projectId) => {
    const project = await Project.findOne({_id: projectId});
    if (!project || (project.private && userID && project.author.toString() !== userID.toString()) || (project.private && !userID)) {
        throw new ReqError('There is no project with such ID', 404);
    }
    return projectSerializer(project);
};

const getProjectBySlug = async (userID, authorID, slug) => {
    const project = await Project.findOne({author: authorID, slug: slug});
    if (!project || (project.private && userID && project.author.toString() !== userID.toString()) || (project.private && !userID)) {
        throw new ReqError('There is no project with such slug', 404);
    }
    return projectSerializer(project);
};

const createProject = async (userID, data) => {
    const createdProject = new Project({...data, author: userID});
    await createdProject.save();
    return projectSerializer(createdProject); //TODO add logic to premium
};

const editProject = async (id, data) => {
    const projectToEdit = await Project.findById(id);
    for (const attribute of Object.keys(data)) {
        projectToEdit[attribute] = data[attribute];
    }
    await projectToEdit.save();
    return projectSerializer(projectToEdit);
};

const deleteProject = async (id) => {
    await Project.findByIdAndDelete(id);
    return {success: true};
};

module.exports = {
    getAllProjects,
    getAllMyProjects,
    getProjectByID,
    getProjectBySlug,
    createProject,
    editProject,
    deleteProject,
};