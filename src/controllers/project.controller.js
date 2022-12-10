const {
    getAllProjects,
    getAllMyProjects,
    getProjectByID,
    getProjectBySlug,
    createProject,
    editProject,
    deleteProject,
} = require('../services/project.service');

const User = require('../models/user.model');
const ReqError = require("../utils/ReqError");

const getAllProjectsController = async (req, res, next) => {
    const getAllProjectsService = await getAllProjects();
    return res.json(getAllProjectsService);
};

const getAllMyProjectsController = async (req, res, next) => {
    const getAllMyProjectsService = await getAllMyProjects(req.user._id);
    return res.json(getAllMyProjectsService);
};

const getProjectByIDController = async (req, res, next) => {
    const getProjectByIDService = await getProjectByID(req.user? req.user._id : null, req.params.id);
    return res.json(getProjectByIDService);
};

const getProjectBySlugController = async (req, res, next) => {
    const author = await User.findOne({username: req.params.username});
    if (!author) {
        throw new ReqError('There is no user with this slug', 404);
    }
    const getProjectBySlugService = await getProjectBySlug(req.user? req.user._id : null, author._id, req.params.slug);
    return res.json(getProjectBySlugService);
};

const createProjectController = async (req, res, next) => {
    const createProjectService = await createProject(req.user._id, req.body);
    return res.json(createProjectService);
};

const editProjectController = async (req, res, next) => {
    const editProjectService = await editProject(req.params.id, req.body);
    return res.json(editProjectService);
};

const deleteProjectController = async (req, res, next) => {
    const deleteProjectService = await deleteProject(req.params.id);
    return res.json(deleteProjectService);
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