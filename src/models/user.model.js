const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const {Schema} = require("mongoose");

const bcryptSalt = process.env['BCRYPT_SALT'];

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
});

userSchema.path('password').required(function () { return this.isActive; }, 'Password is required for active users');
userSchema.path('name').required(function () { return this.isActive; }, 'Name is required for active users');
userSchema.path('lastName').required(function () { return this.isActive; }, 'Last name is required for active users');

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next;
    }

    this.password = await bcrypt.hash(this.password, Number(bcryptSalt));

    next();
});

module.exports = mongoose.model('User', userSchema);