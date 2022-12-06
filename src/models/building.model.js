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
        type: String,
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

const Building = mongoose.model('Building', buildingSchema);

module.exports = Building;