const jwt = require('jsonwebtoken');

const JWTSecret = process.env['JWT_SECRET'];

const auth = async (req, res, next) => {
    const authString = req.headers['Authorization'];
    if (!authString) {
        res.status(403).json({ error: 'Credentials were not provided 1'});
    }
    const bearerString = authString.split(' ');
    if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Token') {
        res.status(403).json({ error: 'Credentials were not provided 2'});
    }
    const isValid = jwt.verify(bearerString[1], JWTSecret, {algorithm: 'HS512'});
    if (!isValid) {
        return res.status(403).json({error: 'Wrong credentials. Access denied'});
    }
    next();
}

module.exports = { auth }