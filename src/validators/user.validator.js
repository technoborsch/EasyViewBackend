const updateProfileValidator = (req, res, next) => {
    if (!req.hasOwnProperty('body') || !req.body) {
        res.status(400).json({error: 'No data in request body was provided'});
    }
    next();
};

module.exports = {updateProfileValidator};