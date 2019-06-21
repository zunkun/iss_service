const isAdmin = require('./isAdmin');
const isAuth = require('./isAuth');
const isNotAuth = require('./isNotAuth');
const isSuperAdmin = require('./isSuperAdmin');

module.exports = {
	isAuth,
	isNotAuth,
	isAdmin,
	isSuperAdmin
};
