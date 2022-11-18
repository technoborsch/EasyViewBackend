const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

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
        required: [true, 'Password is required'],
        validate: {
            validator: (password) => {
                return password.length >= 6;
            },
            message: () => `Password should be at least 6 characters long`
        },
    },
},{
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next;
    }

    this.password = await bcrypt.hash(this.password, Number(bcryptSalt));

    next();
});

module.exports = mongoose.model('User', userSchema);