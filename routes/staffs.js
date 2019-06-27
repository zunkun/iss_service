const ServiceResult = require('../core/ServiceResult');
const { Op } = require('sequelize');
const Router = require('koa-router');
const router = new Router();
const DingStaffs = require('../models/DingStaffs');
const { isOE } = require('../core/auth');

router.prefix('/api/staffs');

/**
* @api {get} /api/staffs?role= 用户列表
* @apiName staffs-query
* @apiGroup 用户
* @apiDescription 用户列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [role] 用户角色  1-技术员 2-SV 3-OE
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 用户列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/', async (ctx, next) => {
	const where = {};
	let { page, limit, keywords, role } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	if (!role || role !== 'undefined') {
		where.role = {
			[Op.in]: [ 1, 2, 3 ]
		};
	} else {
		where.role = role;
	}
	if (keywords && keywords !== 'undefined') {
		let regex = new RegExp(keywords, 'i');
		where.userName = { $regex: regex };
	}
	let staffs = await DingStaffs.findAndCountAll({ where, limit, offset, order: [ [ 'role', 'DESC' ] ] });

	ctx.body = ServiceResult.getSuccess(staffs);
	await next();
});

/**
* @api {post} /api/staffs/oe 设置OE
* @apiName staffs-setoe
* @apiGroup 用户
* @apiDescription 设置OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} userId 需要设置为OE的员工userId
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.post('/oe', async (ctx, next) => {
	let dingstaff = await DingStaffs.findOne({ where: { userId: ctx.request.body.userId } });
	if (!dingstaff) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	await DingStaffs.update({ role: 3 }, { where: { userId: ctx.request.body.userId } });
	ctx.body = ServiceResult.getSuccess();
	await next();
});

/**
* @api {post} /api/staffs/oe 设置员工为OE身份
* @apiName staffs-setoe
* @apiGroup 用户
* @apiDescription 设置员工为OE身份，OE员工离职后，该OE下的项目可以进行项目OE移交设置
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} userId 需要设置为OE的员工userId
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.post('/oe', isOE(), async (ctx, next) => {
	let dingstaff = await DingStaffs.findOne({ where: { userId: ctx.request.body.userId } });
	if (!dingstaff) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	await DingStaffs.update({ role: 3 }, { where: { userId: ctx.request.body.userId } });
	ctx.body = ServiceResult.getSuccess();
	await next();
});

module.exports = router;
