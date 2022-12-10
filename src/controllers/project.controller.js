const User = require('../models/user.model');
const ReqError = require("../utils/ReqError");
const Project = require("../models/project.model");
const projectSerializer = require("../serializers/project.serializer");

const getAllProjectsController = async (req, res) => {
    const projects = await Project.find({private: false});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return res.json(serializedProjects);
};

const getAllMyProjectsController = async (req, res) => {
    const projects = await Project.find({author: req.user._id});
    const serializedProjects = [];
    for (const project of projects) {
        serializedProjects.push(projectSerializer(project));
    }
    return res.json(serializedProjects);
};

const getProjectByIDController = async (req, res) => {
    const userID = req.user? req.user._id : null;
    const project = await Project.findOne({_id: req.params.id});
    if (!project || (project.private && userID && project.author.toString() !== userID.toString()) || (project.private && !userID)) {
        throw new ReqError('There is no project with such ID', 404);
    }
    return res.json(projectSerializer(project));
};

const getProjectBySlugController = async (req, res) => {
    const author = await User.findOne({username: req.params.username});
    if (!author) {
        throw new ReqError('There is no user with this slug', 404);
    }
    const userID = req.user? req.user._id : null;
    const project = await Project.findOne({author: author._id, slug: req.params.slug});
    if (!project || (project.private && userID && project.author.toString() !== userID.toString()) || (project.private && !userID)) {
        throw new ReqError('There is no project with such slug', 404);
    }
    return res.json(projectSerializer(project));
};

const createProjectController = async (req, res) => {
    const createdProject = new Project({...req.body, author: req.user._id});
    await createdProject.save();
    //TODO add logic to premium
    return res.json(projectSerializer(createdProject));
};

const editProjectController = async (req, res) => {
    const projectToEdit = await Project.findById(req.params.id);
    for (const attribute of Object.keys(req.body)) {
        projectToEdit[attribute] = req.body[attribute];
    }
    await projectToEdit.save();
    return res.json(projectSerializer(projectToEdit));
};

const deleteProjectController = async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    return res.json({success: true});
};

module.exports = {
    getAllProjectsController,
    getAllMyProjectsController,
    getProjectByIDController,
    getProjectBySlugController,
    createProjectController,
    editProjectController,
    deleteProjectController,
};