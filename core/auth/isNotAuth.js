'use strict';

module.exports = () => {
	return async function isNotAuth (ctx, next) {
		if (ctx.isAuthenticated()) {
			return ctx.redirect('/');
		}
		return next();
	};
};
