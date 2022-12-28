const {requestPropertyValidatorFactory} = require('../utils/ValidatorFactory');

const {
    viewpointDescriptionValidator,
    viewpointPositionValidator,
    viewpointQuaternionValidator,
    viewpointFovValidator,
    viewpointPublicValidator,
    viewpointDistanceToTargetValidator,
    viewpointClipConstantsStatusValidator,
    viewpointClipConstantsValidator,
} = require('./fieldValidators');
const {isMongoId} = require("validator");

const getViewpointByIdValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ],
    );
    validateParams(req);
    next();
};

const createViewpointValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
            ['buildingID', isMongoId],
            ['position', viewpointPositionValidator],
            ['quaternion', viewpointQuaternionValidator],
            ['distanceToTarget', viewpointDistanceToTargetValidator],
        ],
        [
            ['fov', viewpointFovValidator],
            ['description', viewpointDescriptionValidator],
            ['clipConstantsStatus', viewpointClipConstantsStatusValidator],
            ['clipConstants', viewpointClipConstantsValidator],
            ['public', viewpointPublicValidator],
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
            ['position', viewpointPositionValidator],
            ['quaternion', viewpointQuaternionValidator],
            ['distanceToTarget', viewpointDistanceToTargetValidator],
            ['fov', viewpointFovValidator],
            ['description', viewpointDescriptionValidator],
            ['clipConstantsStatus', viewpointClipConstantsStatusValidator],
            ['clipConstants', viewpointClipConstantsValidator],
            ['public', viewpointPublicValidator],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
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
            ['id', isMongoId],
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