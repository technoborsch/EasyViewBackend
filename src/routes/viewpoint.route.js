const express = require('express');

const {auth, optionalAuth} = require("../middleware/auth.middleware");
const {
    getViewpointByIdValidator,
    createViewpointValidator,
    editViewpointValidator,
    deleteViewpointValidator
} = require('../validators/viewpoint.validator');
const Viewpoint = require('../models/viewpoint.model');

const router = express.Router();

router.get('/viewpoints/:id',
    optionalAuth,
    getViewpointByIdValidator,
    async (req, res) => {
        return res.json(await Viewpoint._getById(req.user, req.params.id));
    }
);

router.post('/viewpoints/',
    auth,
    createViewpointValidator,
    async (req, res) => {
        return res.json(await Viewpoint._create(req.user, req.body));
    }
);

router.put('/viewpoints/:id',
    auth,
    editViewpointValidator,
    async (req, res) => {
        return res.json(await Viewpoint._update(req.user, req.params.id, req.body));
    }
);

router.delete('/viewpoints/:id',
    auth,
    deleteViewpointValidator,
    async (req, res) => {
        return res.json(await Viewpoint._delete(req.user, req.params.id));
    }
);

module.exports = router;