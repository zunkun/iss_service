const ServiceResult = require('../core/ServiceResult');
const { Op } = require('sequelize');
const Router = require('koa-router');
const router = new Router();
const Companies = require('../models/Companies');
const Constants = require('../models/Constants');

router.prefix('/api/companies');

/**
* @api {get} /api/companies?limit=&page=&keywords=&industryId= 客户列表
* @apiName companies-query
* @apiGroup 客户
* @apiDescription 客户列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [industryId] 行业编码
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户列表
* @apiSuccess {Number} data.count 客户总数
* @apiSuccess {Object[]} data.rows 当前页客户列表
* @apiSuccess {String} data.rows.name 客户名称
* @apiSuccess {String} data.rows.costcenter 成本中心
* @apiSuccess {String} data.rows.address 地址
* @apiSuccess {String} data.rows.apcompanycode 项目代码
* @apiSuccess {String} data.rows.email email
* @apiSuccess {String} data.rows.mainfax 传真
* @apiSuccess {String} data.rows.mainphone 电话总机
* @apiSuccess {String} data.rows.shortname 名称缩写
* @apiSuccess {String} data.rows.zippostal 邮编
* @apiSuccess {String} data.rows.email email
* @apiSuccess {String} data.rows.site  网址
* @apiSuccess {Number} data.rows.industryId  行业类型id，参考常量表
* @apiSuccess {Number} data.rows.industry  行业类型，参考常量表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords, industryId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { };

	if (keywords && keywords !== 'undefined') {
		where[Op.or] = ([
			{ name: { [Op.like]: `%${keywords}%` } },
			{ industryName: { [Op.like]: `%${keywords}%` } }
		]);
	}
	if (industryId) {
		where.industryId = industryId;
	}

	let companies = await Companies.findAndCountAll({
		attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] },
		include: [ {
			model: Constants,
			as: 'industry',
			attributes: { exclude: [ 'category' ] }
		} ],
		where,
		limit,
		offset
	});
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
* @apiParam {Number} [industryId]  行业类型id，参考常量表
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户company
* @apiSuccess {String} name 客户名称
* @apiSuccess {String} costcenter 成本中心
* @apiSuccess {String} address 地址
* @apiSuccess {String} apcompanycode 项目代码
* @apiSuccess {String} email email
* @apiSuccess {String} mainfax 传真
* @apiSuccess {String} mainphone 电话总机
* @apiSuccess {String} shortname 名称缩写
* @apiSuccess {String} zippostal 邮编
* @apiSuccess {String} email email
* @apiSuccess {String} site  网址
* @apiSuccess {Number} industryId  行业类型id，参考常量表
* @apiSuccess {Number} industry  行业类型，参考常量表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;

	if (!data.name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	return Companies.create(data).then(company => {
		return Companies.findOne({
			attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] },
			where: { id: company.id },
			include: [ {
				model: Constants,
				as: 'industry',
				attributes: { exclude: [ 'category' ] }
			} ]
		}).then(res => {
			ctx.body = ServiceResult.getSuccess(res);
			next();
		});
	}).catch(error => {
		ctx.body = ServiceResult.getFail(error);
		next();
	});
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
	return Companies.findOne({
		attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] },
		where: { id: ctx.params.id },
		include: [ {
			model: Constants,
			as: 'industry',
			attributes: { exclude: [ 'category' ] }
		} ]
	}).then(res => {
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.error(error);
		ctx.body = ServiceResult.getFail(error);
		next();
	});
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
* @apiParam {String} [industryId]  行业类型id
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
	[ 'name', 'costcenter', 'address', 'apcompanycode', 'email', 'mainfax', 'mainphone', 'shortname', 'zippostal', 'site', 'industryId' ].map(key => {
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
* @apiSuccess {Object} data 客户company
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	await Companies.destroy({ where: { id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

module.exports = router;
