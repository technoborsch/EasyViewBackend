const mongoose = require('mongoose');
const {isEmail} = require('validator');
const {
    usernameValidator,
    passwordValidator,
    nameValidator,
    lastNameValidator,
    aboutValidator,
    organizationValidator,
} = require('../validators/fieldValidators');
const bcrypt = require('bcrypt');
const Token = require("./token.model");
const ReqError = require("../utils/ReqError");

const Schema = mongoose.Schema;

const bcryptSalt = process.env['BCRYPT_SALT'];

/**
 * Schema for user model.
 *
 * User model represents a user of an application and contains all necessary information about him. Required info is
 * email, username, password. Name, lastname, organization, about are optional. Password is stored in database as bcrypt
 * hash.
 * User access flags are: isActive, isAdmin, isModerator, isPremium.
 *  - isActive defines if current user is active, setting flag to false is equal to user's deletion but used to prevent
 * lost of information about user that for example did something inappropriate and then deleted their account. Also,
 * when user has registered but hasn't confirmed his email, this flag is also set to false. It sets to true during
 * activation.
 *  - isAdmin defines if current user is admin, which gives him an ultimate control over all information and users over
 * application. One admin user is created during app startup using environment variables, and only admin can grant
 * admin privileges.
 *   - isModerator defines if a user is moderator. Moderator rights give ultimate control over content and give some
 *   control over other users i.e. suspend them.
 *   - isPremium defines if a user has paid for subscription, which allows to create private projects, add more buildings
 * to a project and use some additional features.
 *
 */
const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email`,
        },
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        validate: {
            validator: usernameValidator,
            message: props => `${props.value} is not a valid username`,
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        validate: {
            validator: passwordValidator,
            message: () => 'This password is not strong enough',
        },
    },
    name: {
        type: String,
        validate: {
            validator: nameValidator,
            message: () => 'This name is not valid name',
        },
    },
    lastName: {
        type: String,
        validate: {
            validator: lastNameValidator,
            message: () => 'This lastname is not valid',
        },
    },
    organization: {
        type: String,
        validate: {
            validator: organizationValidator,
            message: () => 'This organization name is not valid',
        },
    },
    about: {
        type: String,
        validate: {
            validator: aboutValidator,
            message: () => 'This "about" is not valid',
        },
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isModerator: {
        type: Boolean,
        default: false,
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    //TODO avatar
    projects: {
        type: [Schema.Types.ObjectId],
    },
    buildings: {
        type: [Schema.Types.ObjectId],
    },
    participatesIn: {
        type: [Schema.Types.ObjectId],
    },
    visibility: {
        type: Number, //1 is visible to all, 2 is visible to authorized users, 3 is private
        default: 2,
    }
},
{
    timestamps: true,
    methods: {
        async addProject(projectToAdd) {
            await this.checkIfProjectUnique(projectToAdd);
            if (!this.projects.includes(projectToAdd)) {
                this.projects.push(projectToAdd._id);
                await this.save();
            }
        },
        async removeProject(projectToRemove) {
            this.projects = this.projects.splice(this.projects.indexOf(projectToRemove._id), 1);
            await this.save();
        },
        async checkIfProjectUnique(projectToCheck) {
            const Project = require("./project.model");

            for (const projectID of this.projects) {
                const project = await Project.findById(projectID);
                if (project.name === projectToCheck.name) {
                    throw new ReqError('This user already has a project with this name', 409);
                } else if (project.slug === projectToCheck.slug) {
                    throw new ReqError('This user already has a project with this slug', 409);
                }
            }
        },
        async addParticipatingProject(projectToAdd) {
            if (!this.participatesIn.includes(projectToAdd._id)) {
                this.participatesIn.push(projectToAdd._id);
                await this.save();
            }
        },
        async removeParticipatingProject(projectToRemove) {
            if (this.participatesIn.includes(projectToRemove._id)) {
                this.participatesIn = this.participatesIn.splice(this.participatesIn.indexOf(projectToRemove._id), 1);
                await this.save();
            }
        },
        async addBuilding(buildingToAdd) {
            if (!this.buildings.includes(buildingToAdd._id)) {
                this.buildings.push(buildingToAdd._id);
                await this.save();
            }
        },
        async removeBuilding(buildingToRemove) {
            if (this.buildings.includes(buildingToRemove._id)) {
                this.buildings.splice(this.buildings.indexOf(buildingToRemove._id), 1);
                await this.save();
            }
        },
    }
});

//Prior to saving, if password has changed, it has to be encrypted again
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, Number(bcryptSalt));
    }
});

userSchema.pre(['deleteOne', 'deleteMany'], {document: true}, async function () {
    //Delete all the projects that this user has created
    const Project = require("./project.model");
    for await (const projectID of this.projects) {
        const project = await Project.findById(projectID);
        await project.deleteOne();
    }
    //Delete all tokens issued for this user
    await Token.deleteMany({userId: this._id});
    //Delete this user as participant from all the projects he participated in
    for await (const projectID of this.participatesIn) {
        const project = await Project.findById(projectID);
        project.participants.splice(project.participants.indexOf(this._id), 1);
        await project.save();
    }
});

module.exports = mongoose.model('User', userSchema);