const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const dbUsername = process.env['DB_USERNAME'];
const dbPassword = process.env['DB_PASSWORD'];
const dbHost = process.env['DB_HOST'];
const dbPort = process.env['DB_PORT'];
const dbDatabase = process.env['DB_DATABASE']

mongoose
    .connect(`mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbDatabase}`, { useNewUrlParser: true })
	.then(() => {
		const app = express();
		const port = 8080;

		app.use(express.json());
		app.use('/api', routes);

		app.listen(port, ()=>{
			console.log(`Start listening on port ${port}`);
		});
	})