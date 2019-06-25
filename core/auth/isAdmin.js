'use strict';
const DingStaffs = require('../../models/DingStaffs');
const jwt = require('jsonwebtoken');

module.exports = () => {
	return async function isAdmin (ctx, next) {
		let user = jwt.decode(ctx.header.authorization.substr(7));
		const dingstaff = await DingStaffs.findOne({ where: { userId: user ? user.userId : '' } });
		if (user && dingstaff && [ 2, 3, 4 ].indexOf(dingstaff.role) > -1) {
			ctx.state.user = dingstaff;
			await next();
			return;
		}
		ctx.status = 403;
	};
};
