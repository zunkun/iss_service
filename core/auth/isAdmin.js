'use strict';

module.exports = () => {
	return async function isAuth (ctx, next) {
		const user = ctx.user;
		if (ctx.isAuthenticated() && user.role === 1) {
			return next();
		}
		await ctx.redirect('/');
	};
};
