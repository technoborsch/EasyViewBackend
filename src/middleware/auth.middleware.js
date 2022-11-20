const jwt = require('jsonwebtoken');

const JWTSecret = process.env['JWT_SECRET'];

const authMiddleware = async (req, res, next) => {
    const authString = req.get('Authorization');
    if (!authString) {
        res.status(403).json({ error: 'Credentials were not provided'});
    }
    const bearerString = authString.split(' ');
    if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Token') {
        res.status(403).json({ error: 'Credentials were not provided'});
    }
    const isValid = jwt.verify(bearerString[1], JWTSecret, {algorithm: 'HS512'});
    if (!isValid) {
        return res.status(403).json({error: 'Wrong credentials. Access denied'});
    }
    next();
}

module.exports = { auth: authMiddleware }