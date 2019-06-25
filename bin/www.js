#!/usr/bin/env node
require('console-stamp')(console, { pattern: 'yyyy-mm-dd\'T\'HH:MM:ss:l' });
// require('../services/init');
const fs = require('fs');
const path = require('path');
if (process.env.NODE_ENV === 'production') {
	console.log('正式环境');
} else {
	console.log('测试环境');
}

const config = require('../config');
const app = require('../app');
const https = require('https');
const { default: enforceHttps } = require('koa-sslify');

app.use(enforceHttps({
	port: config.PORT2
}));

const port = process.env.PORT || config.PORT || 4000;

var options = {
	key: fs.readFileSync(path.join(__dirname, '../config/ssl/development/iss.key')),
	cert: fs.readFileSync(path.join(__dirname, '../config/ssl/development/iss.crt'))
};

const server = https.createServer(options, app.callback());

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError (error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	switch (error.code) {
	case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
	case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
	default:
		throw error;
	}
}

function onListening () {
	const addr = this.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}
