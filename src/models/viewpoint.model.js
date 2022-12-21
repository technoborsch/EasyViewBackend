const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const viewPointSchema = new Schema({
    buildingID: {
        type: Schema.Types.ObjectId,
        required: true,
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
        _getById(user, id) {

        },
        _create(user, data) {

        },
        _update(user, id, data) {

        },
        _delete(user, id) {

        },
    },
    methods: {
        authorizeTo(user, isAuthorizedTo) {
            switch (isAuthorizedTo) {
                case 'read':
                    return;
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

});

viewPointSchema.pre('save', async function() {

});

module.exports = mongoose.model('Viewpoint', viewPointSchema);