const mongoose = require('mongoose');
const slugify = require("slugify");
const ReqError = require("../utils/ReqError");
const fs = require("fs");

const host = process.env['HOST'];
const port = process.env['PORT'];
const isTLS = Boolean(Number.parseInt(process.env['TLS']));

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
    model: {
        type: String,
    },
    projectID: {
        type: Schema.Types.ObjectId,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    viewpoints: {
        type: [Schema.Types.ObjectId],
    },
    publicViewpoints: {
        type: [Schema.Types.ObjectId],
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
        async _getModel(user, id) {
            const buildingToGetModel = await this.findById(id);
            await buildingToGetModel.authorizeTo(user, 'read');
            return buildingToGetModel.model;
        },
        async _create(user, data, uploadedModel) {
            const Project = require('./project.model');
            const User = require('./user.model');

            const projectToAddBuilding = await Project.findById(data.projectID);
            await User._checkIfAbleToAddBuilding(user, projectToAddBuilding);
            const createdBuilding = new this({...data, author: user._id});
            if (uploadedModel) {await createdBuilding.handleUploadedModel(uploadedModel);}
            await createdBuilding.save();
            const savedBuilding = await this.findById(createdBuilding._id);
            return savedBuilding.serialize();
        },
        async _update(user, id, data, uploadedModel) {
            const buildingToEdit = await this.findById(id);
            await buildingToEdit.authorizeTo(user, 'update');
            for (const attribute of Object.keys(data)) {
                buildingToEdit[attribute] = data[attribute];
            }
            if (uploadedModel) {await buildingToEdit.handleUploadedModel(uploadedModel);}
            await buildingToEdit.save();
            const savedBuilding = await this.findById(buildingToEdit._id);
            return savedBuilding.serialize();
        },
        async _delete(user, id) {
            const buildingToDelete = await this.findById(id);
            await buildingToDelete.authorizeTo(user, 'delete');
            await buildingToDelete.remove();
            return {success: true};
        },
    },
    methods: {
        async handleUploadedModel(model) {
            if (this.model) {
                await fs.promises.rm(this.model);
            }
            const savePath = `/uploads/buildings/${this._id.toString()}/${model.originalname}`;
            await fs.promises.cp(model.path, savePath);
            await fs.promises.rm(model.path);
            this.model = savePath; //No save call
        },
        getModelURL() {
            const protocol = isTLS ? 'https' : 'http';
            return `${protocol}://${host}:${port}/api/v1/buildings/${this._id.toString()}/model`;
        },
        async addViewpoint(viewpointToAdd) {
            if (!this.viewpoints.includes(viewpointToAdd._id)) {
                this.viewpoints.push(viewpointToAdd._id);
            }
            if (viewpointToAdd.public && !this.publicViewpoints.includes(viewpointToAdd._id)) {
                this.publicViewpoints.push(viewpointToAdd);
            } else if (!viewpointToAdd.public && this.publicViewpoints.includes(viewpointToAdd._id)) {
                this.publicViewpoints.splice(this.publicViewpoints.indexOf(viewpointToAdd._id), 1);
            }
            await this.save();
        },
        async removeViewpoint(viewpointToRemove) {
            if (this.viewpoints.includes(viewpointToRemove._id)) {
                this.viewpoints.splice(this.viewpoints.indexOf(viewpointToRemove._id), 1);
            }
            if (this.publicViewpoints.includes(viewpointToRemove._id)) {
                this.publicViewpoints.splice(this.publicViewpoints.indexOf(viewpointToRemove._id), 1);
            }
            await this.save();
        },
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
                model: this.model ? this.getModelURL() : null,
                description: this.description? this.description : null,
                slug: this.slug,
                projectID: this.projectID,
                author: this.author,
                viewpoints: this.publicViewpoints,
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

buildingSchema.pre('remove',async function() {
    const User = require('./user.model');
    const Project = require("./project.model");
    const Viewpoint = require('./viewpoint.model');

    const author = await User.findById(this.author);
    await author.removeBuilding(this);
    const project = await Project.findById(this.projectID);
    await project.removeBuilding(this);

    for (const viewpointID of this.viewpoints) {
        const viewpoint = await Viewpoint.findById(viewpointID);
        await viewpoint.remove();
    }
});

module.exports = mongoose.model('Building', buildingSchema);