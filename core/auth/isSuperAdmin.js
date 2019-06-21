'use strict';
const CorpUsers = require('../../models/CorpUsers');

module.exports = () => {
	return async function isAdmin (ctx, next) {
		const user = ctx.state.user;
		const corpUser = await CorpUsers.findOne({ where: { corpId: ctx.params.corpId, userId: user ? user.id : '' } });
		if (ctx.isAuthenticated() && corpUser && corpUser.role === 30) {
			await next();
			return;
		}
		ctx.status = 403;
	};
};
