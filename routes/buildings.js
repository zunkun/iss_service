const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const Projects = require('../models/Projects');
const Buildings = require('../models/Buildings');

const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');

const { Op } = require('sequelize');

router.prefix('/api/buildings');
/**
* @api {get} /api/buildings?projectId=&limit=&page=&keywords= 建筑列表
* @apiName buildings-query
* @apiGroup 建筑
* @apiDescription 建筑列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} oesv 查询类型 sv-SV编辑中的楼房列表, oe-OE审核通过的楼房列表
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 建筑列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, oesv, limit, keywords, projectId } = ctx.query;

	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	if (!projectId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { projectId };
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}
	where.oesv = oesv === 'oe' ? 'oe' : 'sv';
	let buildings = await Buildings.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(buildings);
	await next();
});

/**
* @api {post} /api/buildings 创建建筑
* @apiName building-create
* @apiGroup 建筑
* @apiDescription 创建建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 建筑building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let project = await Projects.findOne({ where: { id: data.projectId } });
	if (!data.name || !data.projectId || !project) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let building = await Buildings.findOne({ where: { projectId: data.projectId, name: data.name } });
	if (building) {
		ctx.body = ServiceResult.getFail('该项目中已经存在该楼房');
		return;
	}
	data.projectName = project.name;
	data.oesv = 'sv';

	building = await Buildings.create(data);
	ctx.body = ServiceResult.getSuccess(building);
	await next();
});

/**
* @api {get} /api/buildings/:id?projectId= 建筑信息
* @apiName building-info
* @apiGroup 建筑
* @apiDescription 建筑信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {Number} id 建筑id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };
	if (ctx.query.projectId) {
		where.projectId = ctx.query.projectId;
	}
	let building = await Buildings.findOne({ where });
	ctx.body = ServiceResult.getSuccess(building);
	await next();
});

/**
* @api {put} /api/buildings/:id 修改建筑
* @apiName building-modify
* @apiGroup 建筑
* @apiDescription 修改建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {Number} id 建筑id
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };
	if (data.projectId) {
		where.projectId = data.projectId;
	}

	let building = await Buildings.findOne({ where });
	if (!building) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	building = await Buildings.findOne({ where: { projectId: building.projectId, name: data.name } });
	if (building) {
		ctx.body = ServiceResult.getFail('该项目中已经存在该楼房');
		return;
	}
	await Buildings.update(data, { where });
	if (data.name) {
		await Floors.update({ buildingName: data.name }, { where: { buildingId: ctx.params.id } });
		await Spaces.update({ buildingName: data.name }, { where: { buildingId: ctx.params.id } });
	}
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/buildings/:id 删除建筑
* @apiName building-delete
* @apiGroup 建筑
* @apiDescription 删除建筑
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} id 建筑id
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 建筑删除其他表处理
	const where = { id: ctx.params.id };
	if (ctx.request.body.projectId) {
		where.projectId = ctx.request.body.projectId;
	}
	await Buildings.destroy({ where });
	await next();
});

module.exports = router;
