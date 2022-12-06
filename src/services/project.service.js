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

const getAllMyProjects = async (username) => {
    const projects = await Project.find({author: username});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return serializedProjects;
};

const getProjectByID = async (username, projectId) => {
    const project = await Project.findOne({_id: projectId});
    if (!project || (project.private && username && project.author !== username) || (project.private && !username)) {
        throw new ReqError('There is no project with such ID', 404);
    }
    return projectSerializer(project);
};

const getProjectBySlug = async (username, authorUsername, slug) => {
    const project = await Project.findOne({author: authorUsername, slug: slug});
    if (!project || (project.private && username && project.author !== username) || (project.private && !username)) {
        throw new ReqError('There is no project with such slug', 404);
    }
    return projectSerializer(project);
};

const createProject = async (username, data) => {
    const projectData = {...data, author: username};
    const projectWithSameName = await Project.findOne({author: username, name: data.name});
    if (projectWithSameName) {
        throw new ReqError('You already have a project with the same name', 409);
    }
    const projectWithSameSlug = await Project.findOne({author: username, slug: data.slug});
    if (projectWithSameSlug) {
        throw new ReqError('You already have a project with the same slug', 409);
    }
    return projectSerializer(await Project.create(projectData));
};

const editProject = async (id, data) => {
    const projectToEdit = await Project.findById(id);
    const author = projectToEdit.author;
    const projectWithThisName = await Project.findOne({author: author, name: data.name});
    if (projectWithThisName) {
        throw new ReqError('You already have a project with name that you try to set', 409);
    }
    const projectWithThisSlug = await Project.findOne({author: author, slug: data.slug});
    if (projectWithThisSlug) {
        throw new ReqError('You already have a project with slug that you try to set', 409);
    }
    await projectToEdit.updateOne(data);
    return projectSerializer(await Project.findById(id));
};

const deleteProject = async (id) => {
    const projectToDelete = await Project.findById(id);
    if (!projectToDelete) {
        throw new ReqError('There is no such project', 404);
    }
    await projectToDelete.deleteOne();
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