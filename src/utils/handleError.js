const handleError = (error, req, res, next) => {
	if ( error.status) {
		res.status(error.status).json({ error: error.message })
	} else {
		console.log(error);
		res.status(500).json({ error: 'Server error' });
	}
};

module.exports = handleError;