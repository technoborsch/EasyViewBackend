const {requestPropertyValidatorFactory} = require("../../utils/ValidatorFactory");
const fv = require('./project.fields');

const getProjectBySlugValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['username', fv.username],
            ['slug', fv.slug],
        ],
    );
    validateParams(req);
    next();
};

const getProjectByIDValidator = (req, res, next) => {
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
        ]
    );
    validateParams(req);
    next();
};

const createProjectValidator = (req, res, next) => {
    const validateBody = requestPropertyValidatorFactory(
        'body',
        [
        ['name', fv.name],
    ],
        [
        ['description', fv.description],
        ['private', fv.private],
        ['participants', fv.participants],
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
            ['name', fv.name],
            ['description', fv.description],
            ['participants', fv.participants],
        ],
    );
    const validateParams = requestPropertyValidatorFactory(
        'params',
        [
            ['id', fv.id],
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