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
const {
	auth,
	optionalAuth,
} = require('../middleware/auth.middleware');
const {onlyAuthorAndModerators} = require('../middleware/author.middleware');
const {
	getProjectBySlugValidator,
	getProjectByIDValidator,
	createProjectValidator,
	editProjectValidator,
	deleteProjectValidator,
} = require("../validators/project.validator");

// Get all projects
router.get(
	'/projects',
	optionalAuth,
	getAllProjectsController
);
//Get all my projects
router.get(
	'/projects/my',
	auth,
	getAllMyProjectsController
); //TODO make "my" be a parameter to get all projects route
// Get project by slug
router.get(
	'/projects/:username/:slug',
	optionalAuth,
	getProjectBySlugValidator,
	getProjectBySlugController);
// Get project by ID
router.get(
	'/projects/:id',
	optionalAuth,
	getProjectByIDValidator,
	getProjectByIDController,
);
// Create project
router.post(
	'/projects',
	auth,
	createProjectValidator,
	createProjectController
);
// Edit project
router.put(
	'/projects/:id',
	auth,
	onlyAuthorAndModerators('project'), //TODO move authorization logic to models
	editProjectValidator,
	editProjectController
);
// Delete project
router.delete(
	'/projects/:id',
	auth,
	onlyAuthorAndModerators('project'), //TODO move to models
	deleteProjectValidator,
	deleteProjectController
);

module.exports = router;