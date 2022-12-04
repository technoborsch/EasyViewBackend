const express = require("express")
const router = express.Router();

const {
	getAllProjectsController,
	getAllMyProjectsController,
	getProjectByIDController,
	getProjectBySlugController,
	createProjectController,
	editProjectController,
	deleteProjectController,
} = require('../controllers/project.controller');
const {auth, optionalAuth} = require('../middleware/auth.middleware');
const {onlyAuthorAndModerators} = require('../middleware/author.middleware');
const {createProjectValidator, editProjectValidator} = require("../validators/project.validator");

// Get all projects
router.get('/projects', getAllProjectsController);
//Get all my projects
router.get('/projects/my', auth, getAllMyProjectsController);
// Get project by slug
router.get('/projects/:username/:slug', optionalAuth, getProjectBySlugController);
// Get project by ID
router.get('/projects/:id', optionalAuth, getProjectByIDController);
// Create project
router.post('/projects', auth, createProjectValidator, createProjectController);
// Edit project
router.put('/projects/:id', auth, onlyAuthorAndModerators('project'), editProjectValidator, editProjectController);
// Delete project
router.delete('/projects/:id', auth, onlyAuthorAndModerators('project'), deleteProjectController);

module.exports = router;