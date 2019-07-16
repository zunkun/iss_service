const ServiceResult = require('../core/ServiceResult');
const { Op } = require('sequelize');
const Router = require('koa-router');
const router = new Router();
const Companies = require('../models/Companies');

router.prefix('/api/companies');
/**
* @api {get} /api/companies?limit=&page=&keywords=&industryCode= 客户列表
* @apiName companies-query
* @apiGroup 客户
* @apiDescription 客户列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [industryCode] 行业编码
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户列表
* @apiSuccess {Number} data.count 客户总数
* @apiSuccess {Object[]} data.rows 当前页客户列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let user = ctx.state.user;
	let { page, limit, keywords, industryCode } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { oe: { userId: user.userId } };

	if (keywords && keywords !== 'undefined') {
		where[Op.or] = ([
			{ name: { [Op.like]: `%${keywords}%` } },
			{ industryName: { [Op.like]: `%${keywords}%` } }
		]);
	}

	if (industryCode) {
		where.industryCode = industryCode;
	}

	let companies = await Companies.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(companies);
	await next();
});

/**
* @api {post} /api/companies 创建客户
* @apiName company-create
* @apiGroup 客户
* @apiDescription 创建客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} name 客户名称
* @apiParam {String} [costcenter] 成本中心
* @apiParam {String} [address] 地址
* @apiParam {String} [apcompanycode] 项目代码
* @apiParam {String} [email] email
* @apiParam {String} [mainfax] 传真
* @apiParam {String} [mainphone] 电话总机
* @apiParam {String} [shortname] 名称缩写
* @apiParam {String} [zippostal] 邮编
* @apiParam {String} [email] email
* @apiParam {String} [site]  网址
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户customer
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;

	if (!data.name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	let company = await Companies.create(data);
	ctx.body = ServiceResult.getSuccess(company);
	await next();
});

/**
* @api {get} /api/companies/:id 客户信息
* @apiName projects-info
* @apiGroup 客户
* @apiDescription 客户信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let company = await Companies.findOne({ where: { id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess(company);
	await next();
});

/**
* @api {put} /api/companies/:id 修改客户
* @apiName company-modify
* @apiGroup 客户
* @apiDescription 修改客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiParam {String} [name] 客户名称
* @apiParam {String} [costcenter] 成本中心
* @apiParam {String} [address] 地址
* @apiParam {String} [apcompanycode] 项目代码
* @apiParam {String} [email] email
* @apiParam {String} [mainfax] 传真
* @apiParam {String} [mainphone] 电话总机
* @apiParam {String} [shortname] 名称缩写
* @apiParam {String} [zippostal] 邮编
* @apiParam {String} [site]  网址
* @apiParam {String} [industryCode]  行业类型id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const body = ctx.request.body;
	let company = await Companies.findOne({ where: { id: ctx.params.id } });
	if (!company) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	const data = {};
	[ 'name', 'costcenter', 'address', 'apcompanycode', 'email', 'mainfax', 'mainphone', 'shortname', 'zippostal', 'site', 'industryCode' ].map(key => {
		if (body[key]) data[key] = body[key];
	});

	await Companies.update(data, { where: { id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/companies/:id 删除客户
* @apiName company-delete
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
router.delete('/:id', async (ctx, next) => {
	// TODO: 客户删除其他表处理
	await Companies.destroy({ where: { id: ctx.params.id, 'oe.userId': ctx.state.user.userId } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

module.exports = router;
