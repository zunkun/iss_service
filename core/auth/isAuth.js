'use strict';

module.exports = () => {
	return async function isAuth (ctx, next) {
		if (ctx.isAuthenticated()) {
			await next();
			return;
		}
		ctx.status = 403;
	};
};
