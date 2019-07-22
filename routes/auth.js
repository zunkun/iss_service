const jwt = require('jsonwebtoken');
const ServiceResult = require('../core/ServiceResult');
const DingStaffs = require('../models/DingStaffs');
const dingding = require('../core/dingding');
const Router = require('koa-router');
const router = new Router();
const config = require('../config');

router.prefix('/api/auth');

/**
* @api {get} /api/auth/jsconfig 系统配置
* @apiName jsconfig
* @apiGroup 鉴权
* @apiDescription 系统配置
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目列表
* @apiSuccess {Object} data.corpId 企业corpId
* @apiSuccess {Object} data.corpName 企业名称
* @apiSuccess {String} data.agentId 当前应用agentId
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/jsconfig', async (ctx, next) => {
	ctx.body = ServiceResult.getSuccess({
		corpId: config.corpId,
		agentId: config.agentId
	});
});

/**
* @api {get} /api/auth/signature?platform=&url= 签名
* @apiName signature
* @apiGroup 鉴权
* @apiDescription 签名
* @apiParam {String} platform 生成签名的平台, mobile-移动端 pc-PC端
* @apiParam {String} url 当前网页的URL，不包含#及其后面部分
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目列表
* @apiSuccess {Object} data.corpId 企业corpId
* @apiSuccess {String} data.agentId 当前应用agentId
* @apiSuccess {Object} data.url 当前页面url
* @apiSuccess {Object} data.timeStamp 时间戳
* @apiSuccess {Object} data.signature 签名
* @apiSuccess {Object} data.nonceStr 	随机串
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/signature', async (ctx, next) => {
	let { platform, url } = ctx.query;
	if (!url || !platform) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	const signature = await dingding.getJsApiSign({ platform, url });
	ctx.body = ServiceResult.getSuccess(signature);
	await next();
});

/**
* @api {get} /api/auth/login?code=:code&userId= 用户登录
* @apiName login
* @apiGroup 鉴权
* @apiDescription 用户登录
* @apiParam {String} code 钉钉免登code
* @apiParam {String} [userId] 测试环境中使用，没有code,携带钉钉用户的userId
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目列表
* @apiSuccess {Object} data.user 钉钉获取当前用户信息
* @apiSuccess {String} data.user.userId 用户userId
* @apiSuccess {String} data.user.userName 用户userName
* @apiSuccess {String} data.user.jobnumber 工号
* @apiSuccess {Boolean} data.user.oe 当前登录用户是否是oe角色
* @apiSuccess {String} data.user.avatar 图像
* @apiSuccess {String} data.user.mobile 手机
* @apiSuccess {String} data.user.role 系统角色字段，默认为1，该字段为保留字段
* @apiSuccess {Object[]} data.user.depts 部门信息
* @apiSuccess {Number} data.user.depts.deptId 部门deptId
* @apiSuccess {String} data.user.depts.deptName 部门名称
* @apiSuccess {String} data.token token信息,需要鉴权的api中请在header中携带此token
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/login', async (ctx, next) => {
	let code = ctx.query.code;
	if (!code || code === 'undefined') {
		let userId = ctx.query.userId || '4508346521365159';
		let user = await DingStaffs.findOne({ attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }, where: { userId } });
		let token = jwt.sign({ userId: user.userId, userName: user.userName, jobnumber: user.jobnumber, oe: !!user.oe }, config.secret);
		ctx.body = ServiceResult.getSuccess({ user, token: 'Bearer ' + token });

		return;
	}
	try {
		let userInfo = await dingding.getuserinfo(code);
		if (userInfo.errcode !== 0) {
			ctx.body = ServiceResult.getFail(userInfo.errmsg, userInfo.errcode);
			return;
		}
		let user = await DingStaffs.findOne({ attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }, where: { userId: userInfo.userid } });

		if (!user) {
			let userRes = await dingding.getUser(userInfo.userid);
			if (userRes.errcode !== 0) {
				ctx.body = ServiceResult.getFail(user.errmsg, user.errcode);
				return;
			}

			user = {
				userId: user.userid,
				userName: user.name,
				jobnumber: user.jobnumber,
				oe: !!user.oe
			};
		}

		if (!user) {
			ctx.body = ServiceResult.getFail('获取用户信息失败', 404);
			return;
		}

		let token = jwt.sign({ userId: user.userId, userName: user.userName, jobnumber: user.jobnumber, oe: user.oe }, config.secret);

		ctx.body = ServiceResult.getSuccess({ user, token: 'Bearer ' + token });
	} catch (error) {
		console.log(`登录鉴权失败 code: ${code}`, error);
		ctx.body = ServiceResult.getFail(`登录鉴权失败 code: ${code}`, 500);
	}
	await next();
});

module.exports = router;
