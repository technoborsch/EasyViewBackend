require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const compression = require('compression');
const admin = require('sriracha');

const postRoutes = require('./routes/post.route');
const authRoutes = require('./routes/auth.route');
const {auth} = require("./middleware/auth.middleware");

const dbUsername = process.env['DB_USERNAME'];
const dbPassword = process.env['DB_PASSWORD'];
const dbHost = process.env['DB_HOST'];
const dbPort = process.env['DB_PORT'];
const dbDatabase = process.env['DB_DATABASE'];
const adminURL = process.env['ADMIN_URL'];
const adminUser = process.env['ADMIN_USER'];
const adminPassword = process.env['ADMIN_PASSWORD'];

const app = express();
const port = 8080;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(compression());

app.use(adminURL, admin({
	username: adminUser,
	password: adminPassword
}));

app.use('/api', authRoutes);
app.use('/api', auth, postRoutes);

app.use((error, req, res, next) => {
	res.status(500).json({ error: error.message });
});

mongoose.connect(
	`mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbDatabase}`,
	{
		useNewUrlParser: true
	}
).then(() => {
app.listen(port, ()=>{
		console.log(`Start listening on port ${port}`);
	});
});

module.exports = app;