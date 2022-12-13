const express = require('express');
const {auth, optionalAuth} = require("../middleware/auth.middleware");
const {
    getBuildingBySlugValidator,
    getBuildingByIDValidator,
    createBuildingValidator,
    editBuildingValidator,
    deleteBuildingValidator,
} = require("../validators/building.validator");
const Building = require('../models/building.model');

const router = express.Router();

// Get building by slug
router.get(
    '/projects/:username/:projectSlug/buildings/:buildingSlug',
    optionalAuth,
    getBuildingBySlugValidator,
    async (req, res) => {
        return res.json(await Building._getBySlug(
                req.user,
                req.params.username,
                req.params.projectSlug,
                req.params.buildingSlug
            )
        )
    }
);

// Get building by ID
router.get(
    '/buildings/:id',
    optionalAuth,
    getBuildingByIDValidator,
    async (req, res) => { return res.json(await Building._getByID( req.user, req.params.id)) }
);

// Create building
router.post(
    '/buildings',
    auth,
    createBuildingValidator,
    async (req, res) => { return res.json(await Building._create( req.user, req.body )) }
);

// Edit building
router.put(
    '/buildings/:id',
    auth,
    editBuildingValidator,
    async (req, res) => { return res.json(await Building._update( req.user, req.params.id, req.body )) }
);

// Delete building
router.delete(
    '/buildings/:id',
    auth,
    deleteBuildingValidator,
    async (req, res) => { return res.json(await Building._delete( req.user, req.params.id )) }
);

module.exports = router;