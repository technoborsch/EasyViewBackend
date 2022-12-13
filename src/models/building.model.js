const mongoose = require('mongoose');
const slugify = require("slugify");
const ReqError = require("../utils/ReqError");

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
    statics: {
        async _getBySlug(user, username, projectSlug, buildingSlug) {
            const User = require("./user.model");
            const Project = require("./project.model");

            const author = await User.findOne({username: username});
            if (!author) {throw new ReqError('There is no such user', 404);}
            const project = await Project.findOne({author: author._id, slug: projectSlug});
            if (!project || project.isPrivate) {throw new ReqError('There is no such project', 404);}
            const building = await this.findOne({projectID: project._id, slug: buildingSlug});
            if (!building) {throw new ReqError('There is no such building', 404);}
            if (!project.buildings.includes(building._id)) {throw new ReqError('There is no such building in this project', 404);}
            await building.authorizeTo(user, 'read');
            return building.serialize();
        },
        async _getByID(user, id) {
            const building = await this.findById(id);
            if (!building) {throw new ReqError('There is no building with this ID', 404);}
            await building.authorizeTo(user, 'read');
            return building.serialize();
        },
        async _create(user, data) {
            //TODO add logic to premium
            //TODO authorization to create buildings (for participants etc)
            const createdBuilding = new this({...data, author: user._id});
            await createdBuilding.save();
            const savedBuilding = await this.findById(createdBuilding._id);
            return savedBuilding.serialize();
        },
        async _update(user, id, data) {
            const buildingToEdit = await this.findById(id);
            await buildingToEdit.authorizeTo(user, 'update');
            for (const attribute of Object.keys(data)) {
                buildingToEdit[attribute] = data[attribute];
            }
            await buildingToEdit.save();
            const savedBuilding = await this.findById(buildingToEdit._id);
            return savedBuilding.serialize();
        },
        async _delete(user, id) {
            const buildingToDelete = await this.findById(id);
            await buildingToDelete.authorizeTo(user, 'delete');
            await this.findByIdAndDelete(buildingToDelete._id);
            return {success: true};
        },
    },
    methods: {
        async authorizeTo(user, isAuthorizedTo) {
            const Project = require('../models/project.model');
            const projectOfBuilding = await Project.findById(this.projectID);

            switch (isAuthorizedTo) {
                case 'read':
                    if (projectOfBuilding.private && !user
                        || projectOfBuilding.private && user
                        && !user.isAdmin
                        && !user.isModerator
                        && projectOfBuilding.author.toString() !== user._id.toString()
                        && !projectOfBuilding.participants.includes(user._id)
                    ) {throw new ReqError('You are not authorized to read this building info', 403)}
                    return;
                case 'update':
                    if (!user
                        || user
                        && !user.isAdmin
                        && !user.isModerator
                        && projectOfBuilding.author.toString() !== user._id.toString()
                        && this.author.toString() !== user._id.toString()
                    ) {throw new ReqError('You are not authorized to edit this building', 403)}
                    return;
                case 'delete':
                    if (!user
                        || user
                        && !user.isAdmin
                        && !user.isModerator
                        && projectOfBuilding.author.toString() !== user._id.toString()
                        && this.author.toString() !== user._id.toString()
                    ) {throw new ReqError('You are not authorized to delete this building', 403)}
                    return;
                default:
                    throw new Error('Wrong method has been provided');
            }
        },
        serialize() {
            return {
                id: this._id,
                name: this.name,
                description: this.description? this.description : null,
                slug: this.slug,
                projectID: this.projectID,
                author: this.author,
            }
        },
    },
});

buildingSchema.pre('save', async function () {
    const User = require('./user.model');
    const Project = require("./project.model");

    if (this.isNew) {
        this.slug = slugify(this.name);
        const author = await User.findById(this.author);
        await author.addBuilding(this);
        const project = await Project.findById(this.projectID);
        await project.addBuilding(this);
    }

    if (!this.isNew && this.isModified('name')) {
        this.slug = slugify(this.name);
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

module.exports = mongoose.model('Building', buildingSchema);