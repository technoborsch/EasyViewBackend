const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const buildingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    slug: {
        type: String, //TODO make slug be created automatically
        required: true,
    },
    projectID: {
        type: String,
    },
    author: {
        type: String,
    },
}, {
    timestamps: true,
});

//TODO model file
//TODO viewpoints list

const Building = mongoose.model('Building', buildingSchema);

//TODO pre save hook to check if a project already have a building with same name/slug

//TODO add post deletion hook to delete or modify all related objects

module.exports = Building;