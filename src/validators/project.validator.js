const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    projectNameValidator,
    projectDescriptionValidator
} = require("./fieldValidators");
const {
    isBoolean,
    isSlug
} = require('validator');

const createProjectValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory([
        ['name', projectNameValidator],
        ['slug', isSlug]
    ], [
        ['description', projectDescriptionValidator],
        ['private', isBoolean],
    ],
    );
    validateBody(req);
    next();
};

const editProjectValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory([],
        [
            ['name', projectNameValidator],
            ['slug', isSlug],
            ['description', projectDescriptionValidator],
        ]
    );
    validateBody(req);
    next();
};

module.exports = {
    createProjectValidator,
    editProjectValidator,
};