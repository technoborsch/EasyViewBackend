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
router.get('/projects/:username/:projectSlug/buildings/:buildingSlug', getBuildingBySlugController);
// Get building by ID
router.get('/buildings/:id', getBuildingByIDController);
// Create building
router.post('/buildings', auth, createBuildingValidator, createBuildingController);
// Edit building
router.put('/buildings/:id', auth, editBuildingValidator, editBuildingController);
// Delete building
router.delete('/buildings/:id', auth, deleteBuildingController);

module.exports = router;