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

const getAllMyProjects = async (userId) => {
    const projects = await Project.find({author: userId});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return serializedProjects;
};

const getProjectByID = async (userId, projectId) => {
    const project = await Project.findOne({_id: projectId});
    if (!project || (project.private && project.author.toString() !== userId.toString())) {
        throw new ReqError('There is no project with such ID', 404);
    }
    return projectSerializer(project);
};

const getProjectBySlug = async (userId, slug) => {
    const project = await Project.findOne({slug: slug});
    if (!project || (project.private && project.author.toString() !== userId.toString())) {
        throw new ReqError('There is no project with such slug', 404);
    }
    return projectSerializer(project);
};

const createProject = async (userId, data) => {
    const projectData = {...data, author: userId};
    const projectWithSameName = await Project.findOne({name: data.name});
    if (projectWithSameName) {
        throw new ReqError('A project with the same name already exists', 409);
    }
    const projectWithSameSlug = await Project.findOne({slug: data.slug});
    if (projectWithSameSlug) {
        throw new ReqError('A project with the same slug already exists', 409);
    }
    return projectSerializer(await Project.create(projectData));
};

const editProject = async (id, data) => {
    const projectWithThisName = await Project.findOne({name: data.name});
    if (projectWithThisName) {
        throw new ReqError('There is already a project with name that you try to set', 409);
    }
    const projectWithThisSlug = await Project.findOne({slug: data.slug});
    if (projectWithThisSlug) {
        throw new ReqError('There is already a project with slug that you try to set', 409);
    }
    await Project.findByIdAndUpdate(id, data);
    return projectSerializer(await Project.findById(id));
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