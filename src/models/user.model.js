const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const {Schema} = require("mongoose");

const bcryptSalt = process.env['BCRYPT_SALT'];

/**
 * Schema for user model.
 *
 * User model represents a user of an application and contains all necessary information about him. Required info is
 * email, name, lastname, password. Patronymic is optional. Password is stored in database as bcrypt hash.
 * User access flags are: isActive, isAdmin, isModerator.
 *  - isActive defines if current user is active, setting flag to false is equal to user's deletion but used to prevent
 * lost of information about user that for example did something inappropriate and then deleted his account. Also,
 * when user has registered but hasn't confirmed his email, this flag is also set to false. It sets to true during activation.
 *  - isAdmin defines if current user is admin, which gives him an ultimate control over all information and users over
 * application. One admin user is created during app startup using environment variables, and only admin can grant
 * admin privileges.
 *   - isModerator defines if a user is moderator. Moderator rights give ultimate control over content and give some control
 * over other users i.e. suspend them.
 *
 */
const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email`,
        }
    },
    password: {
        type: String,
        validate: {
            validator: (password) => {
                return password.length >= 6;
            },
            message: () => `Password should be at least 6 characters long`,
        },
    },
    name: {
        type: String,
    },
    patronymic: {
        type: String,
    },
    lastName: {
        type: String,
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
        default: false
    },
},
{
    timestamps: true,
    minimize: false,
});

//Password, name and lastname are required for active users.
userSchema.path('password').required(function () { return this.isActive; }, 'Password is required for active users');
userSchema.path('name').required(function () { return this.isActive; }, 'Name is required for active users');
userSchema.path('lastName').required(function () { return this.isActive; }, 'Last name is required for active users');

//Prior to saving, if password has changed, it has to be encrypted again
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next;
    }
    this.password = await bcrypt.hash(this.password, Number(bcryptSalt));
    next();
});

module.exports = mongoose.model('User', userSchema);