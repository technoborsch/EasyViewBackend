const express = require('express');
const multer = require('multer');

const {auth, optionalAuth} = require("../middleware/auth.middleware");
const {
    getBuildingBySlugValidator,
    getBuildingByIDValidator,
    createBuildingValidator,
    editBuildingValidator,
    deleteBuildingValidator,
} = require("../validators/building/building.validator");
const Building = require('../models/building.model');

const router = express.Router();
const upload = multer(
    {
        dest: '/uploads/tmp/models',
        limits: {
            fileSize: 500 * 1024 * 1024, //500 MB
            files: 1 //Only one file
        }
    }
);

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
    async (req, res) => { return res.json(await Building._getByID( req.user, req.params.id )) }
);

//Get a model of a building
router.get(
    '/buildings/:id/model',
    optionalAuth,
    getBuildingByIDValidator,
    async (req, res) => { return res.sendFile(await Building._getModel( req.user, req.params.id )) }
);

// Create building
router.post(
    '/buildings',
    auth,
    upload.single('model'),
    createBuildingValidator,
    async (req, res) => { return res.json(await Building._create( req.user, req.body, req.file )) }
);

// Edit building
router.put(
    '/buildings/:id',
    auth,
    upload.single('model'),
    editBuildingValidator,
    async (req, res) => { return res.json(await Building._update( req.user, req.params.id, req.body, req.file )) }
);

// Delete building
router.delete(
    '/buildings/:id',
    auth,
    deleteBuildingValidator,
    async (req, res) => { return res.json(await Building._delete( req.user, req.params.id )) }
);

module.exports = router;