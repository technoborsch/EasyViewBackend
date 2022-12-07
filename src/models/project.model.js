const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    participants: {
        type: [String],
    },
    buildings: {
        type: [String], //TODO make this contain IDs
    },
    private: {
        type: Boolean,
        required: true,
        default: false,
    },
    author: {
        type: String,
        required: true,
        ref: 'user',
    },
    slug: {
        type: String,
        required: true, //TODO make slug be automatically generated
    },
}, {
    timestamps: true,
}); //TODO add methods to add/delete buildings

const Project = mongoose.model('Project', projectSchema);

//TODO add pre save hook to check if a user already have a project with same name
//TODO add post deletion hook to delete all related objects on deletion

module.exports = Project;