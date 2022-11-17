const mongoose = require('mongoose');
const {isEmail} = require('validator');

const userSchema = mongoose.Schema({
    email: {
        type: String,
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
        }
    }
})

module.exports = mongoose.model('User', userSchema);