const mongoose = require('mongoose');
const slugify = require('slugify');

const ReqError = require("../utils/ReqError");
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
        type: [Schema.Types.ObjectId],
    },
    buildings: {
        type: [Schema.Types.ObjectId],
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
    },
}, {
    timestamps: true,
    methods: {
        async addParticipant(user) {
            this.participants.push(user._id);
            await this.save();
        },
        async removeParticipant(user) {
            this.participants = this.participants.splice(this.participants.indexOf(user._id), 1);
            await this.save();
        },
        async addBuilding(buildingToAdd) {
            await this.checkIfBuildingUnique(buildingToAdd);
            if (!this.buildings.includes(buildingToAdd)) {
                this.buildings.push(buildingToAdd._id);
                await this.save();
            }
        },
        async checkIfBuildingUnique(buildingToCheck) {
            const Building = require("./building.model");
            for await (const buildingID of this.buildings) {
                const building = await Building.findById(buildingID);
                if (building.name === buildingToCheck.name) {
                    throw new ReqError('This project already has a building with this name', 409);
                } else if (building.slug === buildingToCheck.slug) {
                    throw new ReqError('This project already has a building with this slug', 409);
                }
            }
        },
        async removeBuilding(buildingToRemove) {
            this.buildings.splice(this.buildings.indexOf(buildingToRemove._id), 1);
            await this.save();
        },
    }
});

projectSchema.pre('save', async function () {
    const User = require('./user.model')

    if (this.isNew || this.isModified('name')) {
        this.slug = slugify(this.name);
        const user = await User.findById(this.author);
        await user.addProject(this);
    }
    if (this.isModified('participants')) {
        for await (const userID of this.participants) {
            const user = await User.findById(userID);
            await user.addParticipatingProject(this);
        }
    }
});

projectSchema.pre(['deleteOne', 'deleteMany'], {document: true}, async function () {
    const User = require('./user.model')
    const author = await User.findById(this.author);
    await author.removeProject(this);
    for await (const buildingID of this.buildings) {
        const building = await Building.findById(buildingID);
        await building.deleteOne();
    }
    for await (const participantID of this.participants) {
        const participant = await User.findById(participantID);
        await participant.removeParticipatingProject(this);
    }
    for await (const buildingID of this.buildings) {
        const building = await Building.findById(buildingID);
        await building.deleteOne();
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;