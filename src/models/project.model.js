const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
    },
    private: {
        type: Boolean,
        required: true,
        default: false,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    slug: {
        type: String,
        unique: true,
        required: true,
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;