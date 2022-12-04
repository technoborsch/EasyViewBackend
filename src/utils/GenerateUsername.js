const crypto = require('crypto');

const generateUsername = () => {
    return crypto.randomBytes(4).toString('hex');
};

module.exports = generateUsername;