const express = require('express');
const {auth, optionalAuth} = require("../middleware/auth.middleware");
const {
    getBuildingBySlugController,
    getBuildingByIDController,
    createBuildingController,
    editBuildingController,
    deleteBuildingController,
} = require('../controllers/building.controller');
const {
    getBuildingBySlugValidator,
    getBuildingByIDValidator,
    createBuildingValidator,
    editBuildingValidator,
    deleteBuildingValidator,
} = require("../validators/building.validator");

const router = express.Router();

// Get building by slug
router.get(
    '/projects/:username/:projectSlug/buildings/:buildingSlug',
    optionalAuth,
    getBuildingBySlugValidator,
    getBuildingBySlugController
);
// Get building by ID
router.get(
    '/buildings/:id',
    optionalAuth,
    getBuildingByIDValidator,
    getBuildingByIDController
);
// Create building
router.post(
    '/buildings',
    auth,
    createBuildingValidator,
    createBuildingController
); //TODO authorization for moderators, project author and project participants
// Edit building
router.put(
    '/buildings/:id',
    auth,
    editBuildingValidator,
    editBuildingController
); //TODO authorization for moderators, author, project author and project participant
// Delete building
router.delete(
    '/buildings/:id',
    auth,
    deleteBuildingValidator,
    deleteBuildingController
); //TODO authorization for moderators, author and project author

module.exports = router;