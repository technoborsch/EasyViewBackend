const {bodyValidatorFactory} = require("../utils/ValidatorFactory");
const {
    projectNameValidator,
    projectDescriptionValidator,
    projectParticipantsValidator,
    projectPrivateValidator,
} = require("./fieldValidators");

const createProjectValidator = (req, res, next) => {
    const validateBody = bodyValidatorFactory([
        ['name', projectNameValidator],
    ], [
        ['description', projectDescriptionValidator],
        ['private', projectPrivateValidator],
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
            ['description', projectDescriptionValidator],
            ['participants', projectParticipantsValidator],
        ],
    );
    validateBody(req);
    next();
};

module.exports = {
    createProjectValidator,
    editProjectValidator,
};