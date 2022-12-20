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
        default: false,
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    slug: {
        type: String,
    },
}, {
    timestamps: true,
    statics: {
        async _getList(user) {
            const allProjects = await this.find();
            let filteredProjects;
            if (user && (user.isAdmin || user.isModerator)) {
                filteredProjects = allProjects; //Return every project to moderators and admins
            } else {
                filteredProjects = allProjects.filter(project =>
                    !project.private //Return either public projects
                    || (user && project.author.toString() === user._id.toString()) //Or projects where the requester is the author
                    || (user && project.participants.includes(user._id)) //Or where the user is in participants
                );
            }
            const serializedProjects = [];
            for (const project of filteredProjects) {
                serializedProjects.push(project.serialize());
            }
            return serializedProjects;
        },
        async _getUserProjectsList(user) {
            const allProjects = await this.find();
            const thisUserProjects = allProjects.filter(project =>
                project.author.toString() === user._id.toString()
                || project.participants.includes(user._id)
            );
            const serializedProjects = [];
            for (const project of thisUserProjects) {
                serializedProjects.push(project.serialize());
            }
            return serializedProjects;
        },
        async _getBySlug(user, authorUsername, slug) {
            const User = require('../models/user.model');
            const author = await User.findOne({username: authorUsername});
            if (!author || !author.isActive) {throw new ReqError('There is no such user', 404);}
            const project = await this.findOne({author: author._id, slug: slug});
            if (!project) {throw new ReqError('There is no such project', 404);}
            project.authorizeTo(user, 'read');
            return project.serialize();
        },
        async _getByID(user, ID) {
            const project = await this.findById(ID);
            if (!project) {throw new ReqError('There is no such project', 404);}
            project.authorizeTo(user, 'read');
            return project.serialize();
        },
        async _create(user, data) {
            const User = require('../models/user.model');
            await User._checkIfAbleToCreateProject(user, data);
            const createdProject = new this({...data, author: user._id});
            await createdProject.save();
            const savedProject = await this.findById(createdProject._id);
            return savedProject.serialize();
        },
        async _update(user, id, data) {
            const projectToEdit = await this.findById(id);
            projectToEdit.authorizeTo(user, 'update');
            for (const attribute of Object.keys(data)) {
                projectToEdit[attribute] = data[attribute];
            }
            await projectToEdit.save();
            const savedProject = await this.findById(projectToEdit._id);
            return savedProject.serialize();
        },
        async _delete(user, id) {
            const projectToDelete = await this.findById(id);
            projectToDelete.authorizeTo(user, 'delete');
            await projectToDelete.remove();
            return {success: true};
        },
    },
    methods: {
        async addParticipant(user) {
            if (!this.participants.includes(user._id)) {
                this.participants.push(user._id);
                await this.save();
            }
        },
        async removeParticipant(user) {
            if (this.participants.includes(user._id)) {
                const thisUserIndex = this.participants.indexOf(user._id)
                this.participants.splice(thisUserIndex, 1);
                await this.save();
            }
        },
        async addBuilding(buildingToAdd) {
            await this.checkIfBuildingUnique(buildingToAdd);
            if (!this.buildings.includes(buildingToAdd._id)) {
                this.buildings.push(buildingToAdd._id);
                await this.save();
            }
        },
        async removeBuilding(buildingToRemove) {
            if (this.buildings.includes(buildingToRemove._id)) {
                const thisBuildingIndex = this.buildings.indexOf(buildingToRemove._id)
                this.buildings.splice(thisBuildingIndex, 1);
                await this.save();
            }
        },
        async checkIfBuildingUnique(buildingToCheck) {
            const Building = require("./building.model");

            for (const buildingID of this.buildings) {
                const building = await Building.findById(buildingID);
                if (building.name === buildingToCheck.name) {
                    throw new ReqError('This project already has a building with this name', 409);
                } else if (building.slug === buildingToCheck.slug) {
                    throw new ReqError('This project already has a building with this slug', 409);
                }
            }
        },
        authorizeTo(user, isAuthorizedTo) {
            switch (isAuthorizedTo) {
                case 'read':
                    if ((this.private && !user) //If private project and anonymous user
                        || (this.private && user// Or if this is a private project and user is authorized
                        && !user.isAdmin //But requester is neither an admin
                        && !user.isModerator //Nor moderator
                        && this.author.toString() !== user._id.toString() //Nor an author
                        && !this.participants.includes(user._id) //And not in participants list
                    )) {
                        throw new ReqError('You are not authorized to read this project', 403);
                    }
                    return;
                case 'update':
                    if (!user.isAdmin //If requester is neither an admin
                        && !user.isModerator //Nor moderator
                        && this.author.toString() !== user._id.toString() //Nor an author
                    ) {
                        throw new ReqError('You are not authorized to edit this project', 403);
                    }
                    return;

                case 'delete':
                    if (!user.isAdmin //If requester is neither an admin
                        && !user.isModerator //Nor moderator
                        && this.author.toString() !== user._id.toString() //Nor an author
                    ) {
                        throw new ReqError('You are not authorized to delete this project', 403);
                    }
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
                private: this.private,
                participants: this.participants,
                buildings: this.buildings,
                author: this.author,
                slug: this.slug,
            }
        },
    }
});

projectSchema.pre('save', async function () {
    const User = require('./user.model')

    if (this.isNew) {
        this.slug = slugify(this.name);
        const user = await User.findById(this.author);
        await user.addProject(this);
    }
    if (this.isModified('name') && !this.isNew) {
        const user = await User.findById(this.author);
        this.slug = slugify(this.name);
        await user.checkIfProjectUnique(this);
    }
    if (this.isModified('participants')) {
        for await (const userID of this.participants) {
            const user = await User.findById(userID);
            await user.addParticipatingProject(this);
        }
    }
});

projectSchema.pre('remove', async function () {
    const User = require('./user.model');
    const Building = require('./building.model');
    const author = await User.findById(this.author);
    await author.removeProject(this);
    for await (const buildingID of this.buildings) {
        const building = await Building.findById(buildingID);
        await building.remove();
    }
    for await (const participantID of this.participants) {
        const participant = await User.findById(participantID);
        await participant.removeParticipatingProject(this);
    }
});

module.exports = mongoose.model('Project', projectSchema);