const mongoose = require('mongoose');
const ReqError = require('../utils/ReqError');
const Building = require("./building.model");

const Schema = mongoose.Schema;

const viewPointSchema = new Schema({
    buildingID: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    owners: {
        type: [Schema.Types.ObjectId],
    },
    description: {
        type: String,
        default: null,
    },
    public: {
        type: Boolean,
        default: false,
    },
    position: {
        type: [Number], //x, y, z
        required: true,
    },
    quaternion: {
        type: [Number], //x, y, z, w
        required: true,
    },
    fov: {
        type: Number,
        default: 60.0,
    },
    distanceToTarget: {
        type: Number,
        required: true,
    },
    clipConstantsStatus: {
        type: [Boolean],
        default: Array(6).fill(false),
    },
    clipConstants: {
        type: [Number],
    },
}, {
    statics: {
        async _getById(user, id) {
            const viewpointToReturn = await this.findById(id);
            if (!viewpointToReturn) {throw new ReqError('There is no such viewpoint', 404);}
            await viewpointToReturn.authorizeTo(user, 'read');
            await viewpointToReturn.addOwner(user);
            await user.addViewpoint(viewpointToReturn);
            return viewpointToReturn.serialize();
        },
        async _create(user, data) {
            const viewpoint = new this({...data, author: user._id});
            await viewpoint.authorizeTo(user, 'create');
            await viewpoint.addOwner(user); //This also fires save so unnecessary to call it again
            const savedViewpoint = await this.findById(viewpoint._id);
            return savedViewpoint.serialize();
        },
        async _update(user, id, data) {
            const viewpointToUpdate = await this.findById(id);
            await viewpointToUpdate.authorizeTo(user, 'update');
            for (const attribute of Object.keys(data)) {
                viewpointToUpdate[attribute] = data[attribute];
            }
            await viewpointToUpdate.save();
            const savedViewpoint = await this.findById(viewpointToUpdate._id);
            return savedViewpoint.serialize();
        },
        async _delete(user, id) {
            const viewpointToDelete = await this.findById(id);
            await viewpointToDelete.authorizeTo(user, 'delete');
            await user.removeViewpoint(this);
            await viewpointToDelete.removeOwner(user);
            return {success: true}
        },
    },
    methods: {
        async addOwner(user) {
            if (!this.owners.includes(user._id)) {
                this.owners.push(user._id);
            }
            await this.save();
        },
        async removeOwner(user) {
            if (this.owners.includes(user._id)) {
                this.owners.splice(this.owners.indexOf(user._id), 1);
            }
            if (this.owners.length === 0) {
                await this.remove();
            } else { //Deletes if no owners left
                await this.save();
            }
        },
        async authorizeTo(user, isAuthorizedTo) {
            switch (isAuthorizedTo) {
                case 'create':
                case 'read':
                    const Building = require('../models/building.model');
                    const Project = require('../models/project.model');

                    const buildingToAddViewpoint = await Building.findById(this.buildingID);
                    if (!buildingToAddViewpoint) {throw new ReqError('There is no such building', 404);}
                    const projectOfBuilding = await Project.findById(buildingToAddViewpoint.projectID);
                    if (!projectOfBuilding) {throw new ReqError('Project of this building does not exists', 404)}
                    try { //Only users that can read project of building can create viewpoints to the building
                        projectOfBuilding.authorizeTo(user, 'read');
                    } catch (err) {
                        throw new ReqError('You are not authorized to do this', 403);
                    }
                    return;
                case 'update':
                    if (user._id.toString() !== this.author.toString()) {
                        throw new ReqError('You are not authorized to edit this viewpoint', 403);
                    }
                    return;
                case 'delete':
                    if (user._id.toString() !== this.author.toString()
                        && !this.owners.includes(user._id)
                    ) {
                        throw new ReqError('You are not authorized to delete this viewpoint', 403);
                    }
                    return;
                default:
                    throw new Error('Wrong action is given in "authorize" method');
            }
        },
        generateDescription() {
            return 'Viewpoint without description';
        },
        serialize() {
            return {
                id: this._id,
                buildingID: this.buildingID,
                author: this.author,
                description: this.description ? this.description : this.generateDescription(),
                position: this.position,
                quaternion: this.quaternion,
                fov: this.fov,
                public: this.public,
                distanceToTarget: this.distanceToTarget,
                clipConstantsStatus: this.clipConstantsStatus,
                clipConstants: this.clipConstants,
            };
        },
    },
    timestamps: true,
});

viewPointSchema.pre('save', async function() {
    const Building = require('../models/building.model');
    const User = require('../models/user.model');

    if (this.isNew) {
        const buildingOfViewpoint = await Building.findById(this.buildingID);
        const author = await User.findById(this.author);
        await buildingOfViewpoint.addViewpoint(this);
        await author.addViewpoint(this);
    }
    if (!this.isNew && this.isModified('public')) { //To move from list of public viewpoints when property is changed
        const buildingOfViewpoint = await Building.findById(this.buildingID);
        await buildingOfViewpoint.addViewpoint(this);
    }
});

viewPointSchema.pre('remove', async function() {
    const buildingOfViewpoint = await Building.findById(this.buildingID);
    await buildingOfViewpoint.removeViewpoint(this);
});

module.exports = mongoose.model('Viewpoint', viewPointSchema);