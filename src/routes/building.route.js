const express = require('express');
const {auth} = require("../middleware/auth.middleware");
const {
    getBuildingBySlugController,
    getBuildingByIDController,
    createBuildingController,
    editBuildingController,
    deleteBuildingController,
} = require('../controllers/building.controller');
const {
    createBuildingValidator,
    editBuildingValidator
} = require("../validators/building.validator");

const router = express.Router();

// Get building by slug
router.get('/projects/:username/:projectSlug/buildings/:buildingSlug', getBuildingBySlugController); //TODO optional auth to handle buildings in private projects
// Get building by ID
router.get('/buildings/:id', getBuildingByIDController); //TODO optional auth to handle buildings in private projects
// Create building
router.post('/buildings', auth, createBuildingValidator, createBuildingController); //TODO authorization for moderators, project author and project participants
// Edit building
router.put('/buildings/:id', auth, editBuildingValidator, editBuildingController); //TODO authorization for moderators, author, project author and project participant
// Delete building
router.delete('/buildings/:id', auth, deleteBuildingController); //TODO authorization for moderators, author and project author

module.exports = router;