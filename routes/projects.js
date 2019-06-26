const ServiceResult = require('../core/ServiceResult');
const Customers = require('../models/Customers');
const Projects = require('../models/Projects');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');

const { Op } = require('sequelize');
const Router = require('koa-router');
const { isAdmin, isOE } = require('../core/auth');
const areaMap = require('../config/areaMap');

const router = new Router();
router.prefix('/api/projects');

/**
* @api {get} /api/projects?limit=&page=&keywords=&provinceCode=&cityCode=&districtCode=&inuse= 项目列表
* @apiName projects-query
* @apiGroup 项目
* @apiDescription 项目列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {Boolean} [inuse]  是否启用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', isAdmin(), async (ctx, next) => {
	let user = ctx.state.user;
	let { page, limit, keywords, code, provinceCode, cityCode, customerId, inuse } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { $or: [] };
	if (keywords && keywords !== 'undefined') {
		let regex = new RegExp(keywords, 'i');
		where.$or = where.$or.concat([
			{ code: { $regex: regex } },
			{ name: { $regex: regex } },
			{ customerName: { $regex: regex } }
		]);
	}
	where.$or.push({
		'oe.userId': user.userId
	});

	where.$or.push({
		[Op.contains]: { userId: user.userId }
	});

	if (code) { where.code = code; }
	if (provinceCode) { where.code = provinceCode; }
	if (cityCode) { where.cityCode = cityCode; }
	if (customerId) { where.customerId = customerId; }
	if (inuse) { where.inuse = inuse; }

	let projects = await Projects.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(projects);
	await next();
});

/**
* @api {post} /api/projects 创建项目
* @apiName project-create
* @apiGroup 项目
* @apiDescription 创建项目
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} customerId 客户id
* @apiParam {String} code 项目编码
* @apiParam {String} name 项目名称
* @apiParam {String} provinceCode 省份编码
* @apiParam {String} cityCode 城市编码
* @apiParam {String} districtCode  区县编码
* @apiParam {String} street  地址详细
* @apiParam {Object[]} svs sv列表
* @apiParam {String} svs.userId sv userId
* @apiParam {String} svs.userName sv userName
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目project
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isOE(), async (ctx, next) => {
	let user = ctx.state.user;
	const data = ctx.request.body;
	let customer = await Customers.findOne({ where: { id: data.customerId } });
	if (!data.customerId || !customer || !data.code || !data.name || !data.provinceCode || !data.cityCode || !data.districtCode || !data.svs || !data.svs.length) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	let project = await Projects.findOne({
		where: {
			code: data.code,
			'oe.userId': user.userId
		}
	});

	if (project) {
		ctx.body = ServiceResult.getFail(`已存在编号为 ${data.code} 的项目`);
		return;
	}

	data.provinceName = areaMap.province[data.provinceCode];
	data.cityName = areaMap.province[data.cityCode];
	data.districtName = areaMap.province[data.districtCode];

	data.oe = { userId: user.userId, userName: user.userName };

	project = await Projects.create(data);
	ctx.body = ServiceResult.getSuccess(project);
	await next();
});

/**
* @api {get} /api/projects/:id 项目信息
* @apiName projects-info
* @apiGroup 项目
* @apiDescription 项目信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 项目id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let project = await Projects.findOne({ where: { id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess(project);
	await next();
});

/**
* @api {put} /api/projects/:id 修改项目
* @apiName project-modify
* @apiGroup 项目
* @apiDescription 修改项目
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 项目id
* @apiParam {String} [customerId] 客户id
* @apiParam {String} [code] 项目编码
* @apiParam {String} [name] 项目名称
* @apiParam {String} [provinceCode] 省份编码，若修改，必须提供省份编码，城市编码和区域编码
* @apiParam {String} [cityCode] 城市编码，若修改，必须提供省份编码，城市编码和区域编码
* @apiParam {String} [districtCode] 区县编码, 若修改，必须提供省份编码，城市编码和区域编码
* @apiParam {String} [address]  地址详细
* @apiParam {Object[]} [svs] 项目编码
* @apiParam {String} svs.userId sv userId
* @apiParam {String} svs.userName sv userName
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	let user = ctx.state.user;
	const body = ctx.request.body;
	const data = {};
	if (body.code) {
		data.code = body.code;
	}
	if (body.name) {
		data.name = body.name;
	}
	if (body.customerId) {
		let customer = await Customers.findOne({ where: { id: body.customerId } });
		if (!customer) {
			ctx.body = ServiceResult.getFail('参数不正确');
			return;
		}
		data.customerId = body.customerId;
	}

	if (body.provinceCode || body.cityCode || body.districtCode) {
		if (!body.provinceCode || !body.cityCode || !body.districtCode) {
			ctx.body = ServiceResult.getFail('地址参数不正确');
			return;
		}
		data.provinceName = areaMap.province[data.provinceCode];
		data.cityName = areaMap.province[data.cityCode];
		data.districtName = areaMap.province[data.districtCode];
	}

	if (body.street) {
		data.street = body.street;
	}
	if (body.svs && body.svs.length) {
		data.svs = body.svs;
	}

	await Projects.update(data, {
		where: {
			id: ctx.params.id,
			'oe.userId': user.userId
		}
	});
	if (body.name) {
		await Buildings.update({ projectName: body.name }, { where: { projectId: ctx.params.id } });
		await Floors.update({ projectName: body.name }, { where: { projectId: ctx.params.id } });
		await Spaces.update({ projectName: body.name }, { where: { projectId: ctx.params.id } });
	}
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/projects/:id 删除项目
* @apiName project-delete
* @apiGroup 项目
* @apiDescription 删除项目
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 项目id
* @apiSuccess {Object} data 项目project
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 项目删除其他表处理
	await Projects.destroy({ where: { id: ctx.params.id, 'oe.userId': ctx.state.user.userId } });
	await next();
});

module.exports = router;
