const ServiceResult = require('../core/ServiceResult');
const customers = require('../models/customers');
const { Op } = require('sequelize');
const Router = require('koa-router');
const router = new Router();
const { isAdmin, isOE } = require('../core/auth');
const Customers = require('../models/Customers');
// const customers = require('../models/customers');
const constants = require('../config/constants');

router.prefix('/api/customers');
/**
* @api {get} /api/customers?limit=&page=&keywords=&industryCode= 客户列表
* @apiName customers-query
* @apiGroup 客户
* @apiDescription 客户列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [industryCode] 行业编码
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 客户列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', isAdmin(), async (ctx, next) => {
	let user = ctx.state.user;
	let { page, limit, keywords, industryCode } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { $or: [] };
	if (keywords && keywords !== 'undefined') {
		let regex = new RegExp(keywords, 'i');
		where.$or = where.$or.concat([
			{ name: { $regex: regex } },
			{ industryName: { $regex: regex } }
		]);
	}

	where.$or.push({
		'oe.userId': user.userId
	});

	where.$or.push({
		[Op.contains]: { userId: user.userId }
	});

	if (industryCode) {
		where.industryCode = industryCode;
	}

	let customers = await Customers.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(customers);
	await next();
});

/**
* @api {post} /api/customers 创建客户
* @apiName customer-create
* @apiGroup 客户
* @apiDescription 创建客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} name 客户名称
* @apiParam {String} industryCode 行业编码
* @apiParam {String} email 邮箱
* @apiParam {String} site  网址
* @apiParam {String} mobile  联系方式
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 客户customer
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isOE(), async (ctx, next) => {
	let user = ctx.state.user;
	const data = ctx.request.body;

	if (!data.name || !data.industryCode || !data.site || !data.email || !data.mobile) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	data.industryName = constants.industryMap[data.industryCode];
	data.oe = { userId: user.userId, userName: user.userName };

	let customer = await Customers.create(data);
	ctx.body = ServiceResult.getSuccess(customer);
	await next();
});

/**
* @api {put} /api/customers/:id 修改客户
* @apiName customer-modify
* @apiGroup 客户
* @apiDescription 修改客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiParam {String} name 客户名称
* @apiParam {String} industryCode 行业编码
* @apiParam {String} email 邮箱
* @apiParam {String} site  网址
* @apiParam {String} mobile  联系方式
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	let user = ctx.state.user;
	const { name, industryCode, email, site, mobile } = ctx.request.body;
	const data = {};
	let customer = await Customers.findOne({
		where: {
			id: ctx.params.id,
			'oe.userId': user.userId
		}
	});
	if (customer) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	if (industryCode) {
		data.industryCode = industryCode;
		data.industryName = constants.industryMap[industryCode];
	}
	data.name = name || customer.name;
	data.name = email || customer.email;
	data.name = site || customer.site;
	data.name = mobile || customer.mobile;

	await customers.update(data, {
		where: {
			id: ctx.params.id,
			'oe.userId': user.userId
		}
	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/customers/:id 删除客户
* @apiName customer-delete
* @apiGroup 客户
* @apiDescription 删除客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 客户id
* @apiSuccess {Object} data 客户customer
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 客户删除其他表处理
	await Customers.destroy({ where: { id: ctx.params.id, 'oe.userId': ctx.state.user.userId } });
	await next();
});

module.exports = router;
