const {requestPropertyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    projectNameValidator,
    projectDescriptionValidator,
    projectParticipantsValidator,
    projectPrivateValidator,
    usernameValidator,
} = require("./fieldValidators");
const {
    isSlug,
    isMongoId,
} = require('validator');

const getProjectBySlugValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['username', usernameValidator],
            ['slug', isSlug],
        ]
    );
    validateParams(req);
    next();
};

const getProjectByIDValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ]
    );
    validateParams(req);
    next();
};

const createProjectValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
        ['name', projectNameValidator],
    ],
        [
        ['description', projectDescriptionValidator],
        ['private', projectPrivateValidator],
        ['participants', projectParticipantsValidator],
    ],
    );
    validateBody(req);
    next();
};

const editProjectValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [],
        [
            ['name', projectNameValidator],
            ['description', projectDescriptionValidator],
            ['participants', projectParticipantsValidator],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', isMongoId],
        ]
    );
    validateParams(req);
    validateBody(req);
    next();
};

const deleteProjectValidator = getProjectByIDValidator;

module.exports = {
    getProjectBySlugValidator,
    getProjectByIDValidator,
    createProjectValidator,
    editProjectValidator,
    deleteProjectValidator,
};