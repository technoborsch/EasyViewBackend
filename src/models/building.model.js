const mongoose = require('mongoose');
const slugify = require("slugify");

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
    },
    projectID: {
        type: Schema.Types.ObjectId,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
    },
}, {
    timestamps: true,
});

buildingSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name);
    }
    if (this.isModified('author')) {
        const User = require('./user.model');
        const author = await User.findById(this.author);
        await author.addBuilding(this);
    }
    if (this.isModified('projectID')) {
        const Project = require("./project.model");
        const project = await Project.findById(this.projectID);
        await project.addBuilding(this);
    }
});

buildingSchema.post(['deleteOne', 'deleteMany'], {document: true}, async function() {
    const User = require('./user.model');
    const Project = require("./project.model");

    const author = await User.findById(this.author);
    await author.removeBuilding(this);
    const project = await Project.findById(this.projectID);
    await project.removeBuilding(this);
});

//TODO model file
//TODO viewpoints list

const Building = mongoose.model('Building', buildingSchema);

module.exports = Building;