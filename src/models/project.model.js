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
        type: [String],
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
        required: true,
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;