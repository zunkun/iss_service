'use strict';
const DingStaffs = require('../../models/DingStaffs');
const jwt = require('jsonwebtoken');

module.exports = () => {
	return async function isAdmin (ctx, next) {
		let user = jwt.decode(ctx.header.authorization.substr(7));
		let projectId = ctx.params.projectId || ctx.query.projectId || ctx.request.body.projectId;

		const dingstaff = await DingStaffs.findOne({ where: { userId: user ? user.userId : '' } });
		if (user && dingstaff && (dingstaff.oe || dingstaff.pids.indexOf(projectId) > -1 || dingstaff.role === 3)) {
			await next();
			return;
		}
		ctx.status = 403;
	};
};
