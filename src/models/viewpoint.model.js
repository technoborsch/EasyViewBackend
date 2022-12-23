const mongoose = require('mongoose');
const ReqError = require('../utils/ReqError');

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
        type: [Schema.Types.ObjectId], //TODO add logic
    },
    description: {
        type: String,
        default: null,
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
            viewpointToReturn.authorizeTo(user, 'read');
            //TODO add viewpoint to a user that have read this viewpoint at least once
            return viewpointToReturn.serialize();
        },
        async _create(user, data) {
            const Building = require('../models/building.model');
            const Project = require('../models/project.model');

            //TODO move this all to authorizeTO 'read'
            const buildingToAddViewpoint = await Building.findById(data.buildingID);
            if (!buildingToAddViewpoint) {throw new ReqError('There is no such building', 404);}
            const projectOfBuilding = await Project.findById(buildingToAddViewpoint.projectID);
            if (!projectOfBuilding) {throw new ReqError('Project of this building does not exists', 404)}
            try { //Only users that can read project of building can create viewpoints to the building
                projectOfBuilding.authorizeTo(user, 'read');
            } catch (err) {
                throw new ReqError('You are not authorized to add viewpoints to this project', 401);
            }
            const viewpoint = new this({...data, author: user._id});
            await viewpoint.save();
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
            //TODO another logic here: only delete when all users have deleted it
            const viewpointToDelete = await this.findById(id);
            viewpointToDelete.authorizeTo(user, 'delete');
            await viewpointToDelete.remove();
            return {success: true}
        },
    },
    methods: {
        authorizeTo(user, isAuthorizedTo) {
            switch (isAuthorizedTo) {
                case 'create':
                case 'read':
                    return; //TODO only those who can read project of building
                case 'update':
                    return;
                case 'delete':
                    return;
                default:
                    throw new Error('Wrong action is given in "authorize" method');
            }
        },
        generateDescription() {
            return 'description'; //TODO realize
        },
        serialize() {
            return {
                id: this._id,
                buildingID: this.buildingID,
                description: this.description ? this.description : this.generateDescription(),
                position: this.position,
                quaternion: this.quaternion,
                fov: this.fov,
                distanceToTarget: this.distanceToTarget,
                clipConstantsStatus: this.clipConstantsStatus,
                clipConstants: this.clipConstants,
            };
        },
    },
    timestamps: true,
});

viewPointSchema.pre('save', async function() {
    //TODO register viewpoint ID in user model and in building
});

viewPointSchema.pre('remove', async function() {
    //TODO remove viewpoint ID from all users and the building
});

module.exports = mongoose.model('Viewpoint', viewPointSchema);