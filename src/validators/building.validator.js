const {bodyValidatorFactory} = require('../utils/ValidatorFactory');
const {buildingNameValidator, buildingDescriptionValidator} = require("./fieldValidators");
const {
    isSlug,
    isMongoId,
} = require('validator');

const createBuildingValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory(
        [
            ['name', buildingNameValidator],
            ['description', buildingDescriptionValidator],
            ['slug', isSlug],
            ['projectID', isMongoId],
        ],
    );
    validateBody(req);
    next();
};

const editBuildingValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory( [],
        [
            ['name', buildingNameValidator],
            ['description', buildingDescriptionValidator],
            ['slug', isSlug],
            ['projectID', isMongoId],
        ],
    );
    validateBody(req);
    next();
};

module.exports = {
    createBuildingValidator,
    editBuildingValidator,
};