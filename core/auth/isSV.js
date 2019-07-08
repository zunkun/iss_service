'use strict';
const DingStaffs = require('../../models/DingStaffs');
const jwt = require('jsonwebtoken');

module.exports = () => {
	return async function isSV (ctx, next) {
		let user = jwt.decode(ctx.header.authorization.substr(7));
		const dingstaff = await DingStaffs.findOne({ where: { userId: user ? user.userId : '' } });
		let projectId = ctx.params.projectId || ctx.query.projectId || ctx.request.body.projectId;
		if (user && dingstaff && dingstaff.pids.indexOf(projectId) > -1) {
			ctx.state.user = dingstaff;
			await next();
			return;
		}
		ctx.status = 403;
	};
};
