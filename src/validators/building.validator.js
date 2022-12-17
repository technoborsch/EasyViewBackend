const {
    requestPropertyValidatorFactory,
    uploadedFileValidatorFactory,
} = require('../utils/ValidatorFactory');
const {
    buildingNameValidator,
    buildingDescriptionValidator,
    usernameValidator,
} = require("./fieldValidators");
const {
    isSlug,
    isMongoId,
} = require('validator');

const getBuildingBySlugValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['username', usernameValidator],
            ['projectSlug', isSlug],
            ['buildingSlug', isSlug],
        ],
    );
    validateParams(req);
    next();
};

const getBuildingByIDValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ],
    );
    validateParams(req);
    next();
};

const createBuildingValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['name', buildingNameValidator],
            ['description', buildingDescriptionValidator],
            ['projectID', isMongoId],
        ],
    );
    const validateUpload = uploadedFileValidatorFactory(
        ['ifc'],
        ['application/x-step'],
        500,
    );
    validateBody(req);
    validateUpload(req);
    next();
};

const editBuildingValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [],
        [
            ['name', buildingNameValidator],
            ['description', buildingDescriptionValidator],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ]
    );
    const validateUpload = uploadedFileValidatorFactory(
        ['ifc'],
        ['application/x-step'],
        500,
    );
    validateParams(req);
    validateBody(req);
    validateUpload(req);
    next();
};

const deleteBuildingValidator = getBuildingByIDValidator;

module.exports = {
    getBuildingBySlugValidator,
    getBuildingByIDValidator,
    createBuildingValidator,
    editBuildingValidator,
    deleteBuildingValidator,
};