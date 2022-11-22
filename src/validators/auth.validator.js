const {isEmail} = require('validator');

const signupValidator = (req, res, next) => {
    if (!req.hasOwnProperty('body') || !req.body) {
        res.status(400).json({error: 'No data in request body was provided'});
    }
    const data = req.body;
    if (!data.hasOwnProperty('email')) {
        res.status(400).json({error: 'Request body should contain email attribute'});
    }
    if (!isEmail(data.email)) {
        res.status(400).json({error: 'Provided email is not valid'})
    }
    next();
};

const activateValidator = (req, res, next) => {
    if (!req.hasOwnProperty('body') || !req.body) {
        res.status(400).json({error: 'No data in request body was provided'});
    }
    const data = req.body;
    if (!data.hasOwnProperty('id')) {
        res.status(400).json({error: 'Request body should contain id attribute'})
    }
    if (!data.hasOwnProperty('password')) {
        res.status(400).json({error: 'Request body should contain password attribute'});
    }
    if (!data.hasOwnProperty('token')) {
        res.status(400).json({error: 'Request body should contain token attribute'});
    }
    if (data.password.length < 6) {
        res.status(400).json({error: 'Password should be at least 6 characters long'});
    }
    if (!data.hasOwnProperty('name')) {
        res.status(400).json({error: 'Request body should contain name attribute'});
    }
    if (!data.hasOwnProperty('lastName')) {
        res.status(400).json({error: 'Request body should contain lastName attribute'});
    }
    next();
};

const signinValidator = (req, res, next) => {
    const header = req.get('Authorization');
    if (!header) {
        res.status(400).json({ error: 'Request should contain "Authorization" header'});
    }
    const bearerString = header.split(' ');
    if (bearerString.length < 2 || bearerString.length !== 2 || bearerString[0] !== 'Bearer') {
        res.status(400).json({ error: 'Request should contain "Authorization" header in format "Bearer" + " " + ' +
                '"string", where "string" is base64-encoded string of format "user:password"'});
    }
    next();
};

const resetPasswordRequestValidator = signupValidator;

const resetPasswordValidator = (req, res, next) => {
    if (!req.hasOwnProperty('body') || !req.body) {
        res.status(400).json({error: 'No data in request body was provided'});
    }
    const data = req.body;
    if (!data.hasOwnProperty('id')) {
        res.status(400).json({error: 'Request body should contain id attribute'})
    }
    if (!data.hasOwnProperty('token')) {
        res.status(400).json({error: 'Request body should contain token attribute'})
    }
    if (!data.hasOwnProperty('password')) {
        res.status(400).json({error: 'Request body should contain password attribute'})
    }
    if (data.password.length < 6) {
        res.status(400).json({error: 'Password should be at least 6 characters long'});
    }
    next();
};

module.exports = {
    signupValidator,
    activateValidator,
    signinValidator,
    resetPasswordValidator,
    resetPasswordRequestValidator
};