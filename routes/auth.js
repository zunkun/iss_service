const jwt = require('jsonwebtoken');
const ServiceResult = require('../core/ServiceResult');
const DingStaffs = require('../models/DingStaffs');
const dingding = require('../core/dingding');
const Router = require('koa-router');
const router = new Router();
const config = require('../config');

router.prefix('/api/auth');

/**
* @api {get} /api/auth/login?code=:code&userId= 用户登录
* @apiName login
* @apiGroup 鉴权
* @apiDescription 用户登录
* @apiParam {String} code 钉钉免登code
* @apiParam {String} userId 测试环境中使用，没有code,携带钉钉用户的userId
* @apiSuccess {Object} user 钉钉获取当前用户信息
* @apiSuccess {String} token token信息,需要鉴权的api中请在header中携带此token
*/
router.get('/login', async (ctx, next) => {
	let code = ctx.query.code;
	if (!code || code === 'undefined') {
		ctx.body = ServiceResult.getFail('参数不正确', 404);
		let userId = ctx.query.userId || '03020644054858';
		let user = await DingStaffs.findOne({ where: { userId } });

		let token = jwt.sign({ userId: user.userId, userName: user.userName, jobnumber: user.jobnumber }, config.secret);

		ctx.body = ServiceResult.getSuccess({ user, token: 'Bearer ' + token });

		return;
	}
	try {
		let userInfo = await dingding.getuserinfo(code);
		if (userInfo.errcode !== 0) {
			ctx.body = ServiceResult.getFail(userInfo.errmsg, userInfo.errcode);
			return;
		}
		let user = await DingStaffs.findOne({ where: { userId: userInfo.userid } });

		if (!user) {
			let userRes = await dingding.getUser(userInfo.userid);
			if (userRes.errcode !== 0) {
				ctx.body = ServiceResult.getFail(user.errmsg, user.errcode);
				return;
			}

			user = {
				userId: user.userid,
				userName: user.name,
				jobnumber: user.jobnumber
			};
		}

		if (!user) {
			ctx.body = ServiceResult.getFail('获取用户信息失败', 404);
			return;
		}

		let token = jwt.sign({ userId: user.userId, userName: user.userName, jobnumber: user.jobnumber }, config.secret);

		ctx.body = ServiceResult.getSuccess({ user, token: 'Bearer ' + token });
	} catch (error) {
		console.log(`登录鉴权失败 code: ${code}`, error);
		ctx.body = ServiceResult.getFail(`登录鉴权失败 code: ${code}`, 500);
	}
	await next();
});

module.exports = router;
