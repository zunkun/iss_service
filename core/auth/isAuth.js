'use strict';

module.exports = () => {
	return async function isAuth (ctx, next) {
		console.log('当前是否登录', ctx.isAuthenticated());
		if (ctx.isAuthenticated()) {
			return next();
		}
		await ctx.redirect('/signin');
	};
};
