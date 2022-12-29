const {
    requestPropertyValidatorFactory,
    uploadedFileValidatorFactory,
} = require('../../utils/ValidatorFactory');
const fv = require('./building.fields');

const getBuildingBySlugValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['username', fv.username],
            ['projectSlug', fv.slug],
            ['buildingSlug', fv.slug],
        ],
    );
    validateParams(req);
    next();
};

const getBuildingByIDValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
        ],
    );
    validateParams(req);
    next();
};

const createBuildingValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['name', fv.name],
            ['description', fv.description],
            ['projectID', fv.id],
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
            ['name', fv.name],
            ['description', fv.description],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
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