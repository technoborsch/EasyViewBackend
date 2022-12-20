const fs = require('fs');
const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const redis = require("../utils/RedisClient");
const Token = require("./token.model");
const ReqError = require("../utils/ReqError");
const sendEmail = require("../utils/sendEmail");
const {
    usernameValidator,
    passwordValidator,
    nameValidator,
    lastNameValidator,
    aboutValidator,
    organizationValidator,
} = require('../validators/fieldValidators');

const host = process.env['HOST'];
const port = process.env['PORT'];
const isTLS = Boolean(Number.parseInt(process.env['TLS']));

const bcryptSalt = process.env['BCRYPT_SALT'];
const JWTSecret = process.env['JWT_SECRET'];
const frontendUrl = process.env['FRONTEND_URL'];
const refreshJWTExpiry = process.env['REFRESH_JWT_EXPIRY']; //in days
const accessJWTExpiry = process.env['ACCESS_JWT_EXPIRY']; //in minutes

const privateProjectsPerFreeUser = Number.parseInt(process.env['PRIVATE_PROJECTS_PER_FREE_USER']);
const privateProjectsPerPremiumUser = Number.parseInt(process.env['PRIVATE_PROJECTS_PER_PREMIUM_USER']);
const publicProjectsPerFreeUser = Number.parseInt(process.env['PUBLIC_PROJECTS_PER_FREE_USER']);
const publicProjectsPerPremiumUser = Number.parseInt(process.env['PUBLIC_PROJECTS_PER_PREMIUM_USER']);

const Schema = mongoose.Schema;

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
    avatar: {
        type: String, //Path to a file on SFTP/FTP/Cloud
        default: null,
    },
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
    statics: { //Start with underscore to avoid collisions with existing queries and methods
        async _getList(user) {
            const allActiveUsers = await this.find({isActive: true});
            let users;
            if (!user) {  //Return those users that set visibility to "to all" to unauthorized users
                users = allActiveUsers.filter(userFromArray => userFromArray.visibility === 1);
            } else {
                if (user.isModerator || user.isAdmin) { //Return all active users to moderators
                    users = allActiveUsers;
                } else { //For usual user, return those who set visibility to 1 or 2 and this user too
                    users = allActiveUsers.filter(
                        userFromArray => userFromArray.visibility === 1
                            || userFromArray.visibility === 2
                            || userFromArray._id.toString() === user._id.toString()
                    );
                }
            }
            const serializedUsers = [];
            for (const userToReturn of users) {
                serializedUsers.push(userToReturn.serialize(user));
            }
            return serializedUsers;
        },
        async _getByID(user, id) {
            const requestedUser = await this.find({_id: id});
            if (!user && requestedUser.visibility !== 1 ) {
                throw new ReqError('There is no such user', 404);
            } else {
                return requestedUser.serialize(user);
            }
        },
        async _getByUsername(user, username) {
            const requestedUser = await this.findOne({username: username});
            if (!requestedUser || !user && requestedUser.visibility !== 1 ) {
                throw new ReqError('There is no such user', 404);
            } else {
                return requestedUser.serialize(user);
            }
        },
        async _getAvatar(user, id) {
            const profileToGetAvatar = await this.findById(id);
            if (!profileToGetAvatar.serialize(user).hasOwnProperty('avatar')) {
                throw new ReqError('You are not authorized to get this user avatar', 403);
            }
            return profileToGetAvatar.avatar;
        },
        async _updateProfile(user, id, data, uploadedAvatar) {
            const profileToUpdate = await this.findById(id);
            profileToUpdate.authorizeTo(user, 'update');
            for (const attribute of Object.keys(data)) {
                profileToUpdate[attribute] = data[attribute];
            }
            if (uploadedAvatar) {await profileToUpdate.handleNewAvatar(uploadedAvatar);}
            await profileToUpdate.save();
            const savedUser = await this.findById(profileToUpdate._id);
            return savedUser.serialize(savedUser);
        },
        async _deleteProfile(user, id) {
            const profileToDelete = id? await this.findById(id) : user;
            profileToDelete.authorizeTo(user, 'delete');
            await profileToDelete.remove();
            return {success: true};
        },
        async _signUp(data) {
            let user = await this.findOne({ email: data.email});
            //If there is already a user with this email and is active, reject registration
            if (user && user.isActive) {
                throw new ReqError('Email already exists', 409);
            }
            // If there is already a user with this username but with different email, reject registration
            let userWithSameUsername = await this.findOne({username: data.username});
            if (userWithSameUsername && userWithSameUsername.email !== data.email) {
                throw new ReqError('This username is already in use', 409);
            }
            if (!user) { //Then create one
                user = new this(data); //Potentially dangerous, very strict validation of data must be performed
                await user.save();
            } else { //Then it means that we have not active existing user that probably already had a token
                //If there is already a token for this user issued less than a minute ago, reject request
                let token = await Token.findOne({ userId: user._id, forReset: false });
                if (token && Date.now() - token.createdAt < 60 * 1000) { // a minute
                    throw new ReqError('You already have a registration token issued less than a minute ago, please use it or try again later', 409);
                }
            }
            //Create a token with this user id and random activation string, encrypted with bcrypt
            let activateToken = crypto.randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(activateToken, Number(bcryptSalt));
            await new Token({
                userId: user._id,
                token: hash,
                createdAt: Date.now(),
            }).save();
            //Create confirmation link and send email to registered user
            const link = frontendUrl + '/confirm_email' + '?' + `token=${activateToken}` + '&' + `id=${user._id}`;
            await sendEmail(
                data.email,
                'Easyview registration',
                {
                    link: link,
                    },
                '../templates/registrationEmail.handlebar',
                );
            //Return success info
            return {success: true}
        },
        async _activate(data) {
              const activationToken = await Token.findOne({userId: data.id, forReset: false});
              //If there is no such token or the token is for another user, reject request
              if (!activationToken) throw new ReqError('Invalid or expired activation token', 401);
              const isValid = await bcrypt.compare(data.token, activationToken.token);
              if (!isValid) throw new ReqError('Invalid or expired activation token', 401);
              const user = await this.findById(data.id);
              //If there is no such user in database for some reason, reject request
              if (!user) throw new ReqError('No such user', 404);
              user.isActive = true;
              await user.save();
              return {success: true}
        },
        async _signIn(user) {
            //Create new token pair that expires in set time
            const accessToken = await jwt.sign(
                { id: user._id },
                JWTSecret,
                {expiresIn: accessJWTExpiry + 'm'}
            );
            const refreshToken = await jwt.sign(
                {id: user._id, refresh: true},
                JWTSecret,
                {expiresIn: refreshJWTExpiry + 'd'}
            );
            //If exists, blacklist previous refresh token
            const previousRefreshToken = await redis.getActualTokenOfUser(user._id);
            if (previousRefreshToken) {await redis.addTokenToBlackList(previousRefreshToken);}
            //Set this refresh token as current for this user in redis
            await redis.setTokenToUser(user._id, refreshToken);
            //Return data about authorized user, created access and refresh tokens
            return {
                user: user.serialize(user),
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        },
        async _logOut(user, token) {
            const currentRefreshToken = await redis.getActualTokenOfUser(user._id);
            await redis.addTokenToBlackList(currentRefreshToken);
            await redis.addTokenToBlackList(token);
            return {success: true};
        },
        async _requestPasswordReset(data) {
            //If there is no such user with this email or the user is inactive, reject request
            const user = await this.findOne({ email: data.email });
            if (!user || !user.isActive) throw new ReqError("User does not exist", 404);
            //If there is already token for this user, delete it
            let token = await Token.findOne({ userId: user._id, forReset: true });
            // Existing token created less than a minute ago
            if (token && Date.now() - token.createdAt < 60 * 1000 ) {
                throw new ReqError('You have already requested password reset earlier, try again later', 409);
            }
            //Create new token
            let resetToken = crypto.randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
            await new Token({
                userId: user._id,
                token: hash,
                createdAt: Date.now(),
                forReset: true,
            }).save();
            //Generate link to change password and send message to user's email
            const link = frontendUrl + '/reset_password' + '?' + `token=${resetToken}` + '&' + `id=${user._id}`
            await sendEmail(
                user.email,
                'Password reset request',
                {
                    name: user.name,
                    link: link,
                },
                '../templates/passwordResetEmail.handlebar',
            );
            //Return success information
            return {success: true};
        },
        async _resetPassword(data) {
            //If there is no such token, reject request
            let passwordResetToken = await Token.findOne({ userId: data.id, forReset: true });
            if (!passwordResetToken) { throw new ReqError("Invalid, non-existent or expired password reset token", 401); }
            //If provided token doesn't match saved one, reject
            const isValid = await bcrypt.compare(data.token, passwordResetToken.token);
            if (!isValid) { throw new ReqError("Invalid or expired password reset token", 401); }
            //If there is no such user, reject
            const user = await this.findById(data.id);
            if (!user || !user.isActive) { throw new ReqError("User does not exist", 404); }
            //Set new password to user and save
            user.password = data.password;
            await user.save();
            await passwordResetToken.remove();
            //return info that it was successful
            return {success: true};
        },
        async _refreshToken(user, token) {
            const accessToken = await jwt.sign(
                { id: user._id },
                JWTSecret,
                {expiresIn: accessJWTExpiry + 'm'}
            );
            const refreshToken = await jwt.sign(
                {id: user._id, refresh: true},
                JWTSecret,
                {expiresIn: refreshJWTExpiry + 'd'}
            );
            //Add old token to blacklist and assign token to user
            await redis.addTokenToBlackList(token);
            await redis.setTokenToUser(user._id, refreshToken);
            return {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        },
        async _checkIfAbleToCreateProject(user, data) {
            const Project = require('../models/project.model');
            const thisUserProjects = await Project.find({author: user._id});
            let privateProjects = 0;
            let publicProjects = 0;
            for (const project of thisUserProjects) {
                if (project.private) {
                    privateProjects++;
                } else {
                    publicProjects++;
                }
            }
            if (user.isPremium) {
                if (data.private && privateProjects >= privateProjectsPerPremiumUser) {
                    throw new ReqError('You are not able to create more private projects', 403);
                }
                if (!data.private && publicProjects >= publicProjectsPerPremiumUser) {
                    throw new ReqError('You are not able to create more public projects', 403);
                }
            } else {
                if (data.private && privateProjects >= privateProjectsPerFreeUser) {
                    throw new ReqError('You are not able to create more private projects as free user', 403);
                }
                if (!data.private && publicProjects >= publicProjectsPerFreeUser) {
                    throw new ReqError('You are not able to create more public projects as free user', 403);
                }
            }
        },
    },
    methods: {
        async addProject(projectToAdd) {
            await this.checkIfProjectUnique(projectToAdd);
            if (!this.projects.includes(projectToAdd)) {
                this.projects.push(projectToAdd._id);
                await this.save();
            }
        },
        async removeProject(projectToRemove) {
            this.projects.splice(this.projects.indexOf(projectToRemove._id), 1);
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
                this.participatesIn.splice(this.participatesIn.indexOf(projectToRemove._id), 1);
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
        async handleNewAvatar(uploadedAvatar) {
            const savePath = `/uploads/users/${this._id.toString()}/${uploadedAvatar.originalname}`;
            fs.cpSync(uploadedAvatar.path, savePath); //TODO make it work with just cp without sync
            fs.rmSync(uploadedAvatar.path);
            this.avatar = savePath; //No save call
        },
        getAvatarURL() {
            const protocol = isTLS ? 'https' : 'http';
            return `${protocol}://${host}:${port}/api/v1/user/${this._id.toString()}/avatar`;
        },
        authorizeTo(user, isAuthorizedTo) {
            switch (isAuthorizedTo) {
                case 'update': //Admin, moderators and user themselves
                    if (!user.isAdmin && !user.isModerator && this._id.toString() !== user._id.toString()) {
                        throw new ReqError('You are not authorized to edit this user profile', 403);
                    }
                    return;
                case 'delete': //Admin, moderators and user themselves
                    if (!user.isAdmin && !user.isModerator && this._id.toString() !== user._id.toString()) {
                        throw new ReqError('You are not authorized to delete this user profile', 403);
                    }
                    return;
                default:
                    throw new Error('Wrong action was provided');
            }
        },
        serialize(forWho) { //TODO DRY this serializer
            if (!forWho && this.visibility === 1) {
                return {
                    id: this._id,
                    username: this.username,
                    name: this.name? this.name : null,
                    lastName: this.lastName? this.lastName : null,
                    organization: this.organization? this.organization : null,
                    about: this.about? this.about : null,
                    isPremium: this.isPremium,
                    projects: this.projects,
                    buildings: this.buildings,
                    participatesIn: this.participatesIn,
                    avatar: this.avatar? this.getAvatarURL() : null,
                }
            } else {
                if (this._id.toString() === forWho._id.toString()
                    || forWho.isAdmin
                    || forWho.isModerator
                ) { //Full info for self and moderators
                    return {
                        id: this._id,
                        email: this.email,
                        username: this.username,
                        name: this.name? this.name : null,
                        lastName: this.lastName? this.lastName : null,
                        organization: this.organization? this.organization : null,
                        about: this.about? this.about : null,
                        isAdmin: this.isAdmin,
                        isModerator: this.isModerator,
                        isPremium: this.isPremium,
                        projects: this.projects,
                        buildings: this.buildings,
                        participatesIn: this.participatesIn,
                        visibility: this.visibility,
                        avatar: this.avatar? this.getAvatarURL() : null,
                    }
                } else {
                    if (this.visibility === 3) {
                        return {
                            id: this._id,
                            username: this.username,
                        }
                    } else {
                        return {
                            id: this._id,
                            username: this.username,
                            name: this.name? this.name : null,
                            lastName: this.lastName? this.lastName : null,
                            organization: this.organization? this.organization : null,
                            about: this.about? this.about : null,
                            isPremium: this.isPremium,
                            projects: this.projects,
                            buildings: this.buildings,
                            participatesIn: this.participatesIn,
                            avatar: this.avatar? this.getAvatarURL() : null,
                        }
                    }
                }
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

userSchema.pre('remove', async function () {
    //Delete all the projects that this user has created
    const Project = require("./project.model");
    for (const projectID of this.projects) {
        const project = await Project.findById(projectID);
        await project.remove();
    }
    //Delete all tokens issued for this user
    await Token.deleteMany({userId: this._id});
    //Delete this user as participant from all the projects he participated in
    for (const projectID of this.participatesIn) {
        const project = await Project.findById(projectID);
        if (project) {
            await project.removeParticipant(this);
        }
    }
    //Delete his personal file folder if exists
    if (this.avatar) {
        await fs.rmSync(`/uploads/users/${this._id.toString()}`, {recursive: true, force: true});
    }
});

module.exports = mongoose.model('User', userSchema);