const express = require("express");

const Project = require('../models/project.model');
const router = express.Router();
const {
	auth,
	optionalAuth,
} = require('../middleware/auth.middleware');
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
	async (req, res) => {
		return res.json(await Project._getList(req.user));
	}
);
//Get all my projects
router.get(
	'/projects/my',
	auth,
	async (req, res) => {
		return res.json(await Project._getUserProjectsList(req.user));
	}
); //TODO make "my" be a parameter to get all projects route
// Get project by slug
router.get(
	'/projects/:username/:slug',
	optionalAuth,
	getProjectBySlugValidator,
	async (req, res) => {
		return res.json(await Project._getBySlug(req.user, req.params.username, req.params.slug));
	}
);
// Get project by ID
router.get(
	'/projects/:id',
	optionalAuth,
	getProjectByIDValidator,
	async (req, res) => {
		return res.json(await Project._getByID(req.user, req.params.id));
	}
);
// Create project
router.post(
	'/projects',
	auth,
	createProjectValidator,
	async (req, res) => {
		return res.json(await Project._create(req.user, req.body));
	}
);
// Edit project
router.put(
	'/projects/:id',
	auth,
	editProjectValidator,
	async (req, res) => {
		return res.json(await Project._update(req.user, req.params.id, req.body));
	}
);
// Delete project
router.delete(
	'/projects/:id',
	auth,
	deleteProjectValidator,
	async (req, res) => {
		return res.json(await Project._delete(req.user, req.params.id));
	}
);

module.exports = router;