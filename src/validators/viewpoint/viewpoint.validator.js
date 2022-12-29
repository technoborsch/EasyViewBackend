const {requestPropertyValidatorFactory} = require('../../utils/ValidatorFactory');
const fv = require('./viewpoint.fields');

const getViewpointByIdValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
        ],
    );
    validateParams(req);
    next();
};

const createViewpointValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['buildingID', fv.id],
            ['position', fv.position],
            ['quaternion', fv.quaternion],
            ['distanceToTarget', fv.distanceToTarget],
        ],
        [
            ['fov', fv.fov],
            ['description', fv.description],
            ['clipConstantsStatus', fv.clipConstantsStatus],
            ['clipConstants', fv.clipConstants],
            ['public', fv.public],
        ],
    );
    validateBody(req);
    next();
};

const editViewpointValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [],
        [
            ['position', fv.position],
            ['quaternion', fv.quaternion],
            ['distanceToTarget', fv.distanceToTarget],
            ['fov', fv.fov],
            ['description', fv.description],
            ['clipConstantsStatus', fv.clipConstantsStatus],
            ['clipConstants', fv.clipConstants],
            ['public', fv.public],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
        ],
    );
    validateParams(req);
    validateBody(req);
    next();
};

const deleteViewpointValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
        ],
    );
    validateParams(req);
    next();
};

module.exports = {
    getViewpointByIdValidator,
    createViewpointValidator,
    editViewpointValidator,
    deleteViewpointValidator,
};