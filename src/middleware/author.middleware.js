const Project = require('../models/project.model');
const ReqError = require("../utils/ReqError");

const onlyAuthorAndModerators = (modelName) => {
    let model;
    switch (modelName) {
        case ('project'):
            model = Project;
            break;
        default:
            throw new Error('You should specify a model for authentication middleware');
    }
        return async (req, res, next) => {
        const authenticatedUser = req.user;
        let ObjectThatShouldBeChanged;
        if (req.params.slug) {
            ObjectThatShouldBeChanged = await model.findOne({author: req.params.id, slug: req.params.slug});
        } else {
            ObjectThatShouldBeChanged = await model.findById(req.params.id);
        }
        const authorID = ObjectThatShouldBeChanged.author;
        if (!authenticatedUser.isAdmin
            && !authenticatedUser.isModerator
            && authenticatedUser._id.toString() !== authorID.toString()
        ) { if (ObjectThatShouldBeChanged.private) {
            throw new ReqError('There is no such object', 404);
        } else {
            throw new ReqError('You are not authorized to change this object', 403);
        }
        }
        next();
    };
};

const onlySelfAndModerators = async (req, res, next) => {
    const authenticatedUser = req.user;
    if (!authenticatedUser.isAdmin
        && !authenticatedUser.isModerator
        && !authenticatedUser._id.toString() === req.params.id
    ) {
        throw new ReqError('You are not allowed to modify this user', 403);
    }
    next();
};

module.exports = {
    onlyAuthorAndModerators,
    onlySelfAndModerators,
}
