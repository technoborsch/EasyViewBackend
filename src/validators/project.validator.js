const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    projectNameValidator,
    projectDescriptionValidator,
    projectParticipantsValidator,
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
        ['participants', projectParticipantsValidator],
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
            ['participants', projectParticipantsValidator],
        ]
    );
    validateBody(req);
    next();
};

module.exports = {
    createProjectValidator,
    editProjectValidator,
};