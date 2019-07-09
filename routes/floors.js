const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');

router.prefix('/api/floors');
/**
* @api {get} /api/floors?projectId=&buildingId=&limit=&page=&keywords= 楼层列表
* @apiName floors-query
* @apiGroup 楼层
* @apiDescription 楼层列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 楼层列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords, buildingId, projectId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	if (!buildingId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { buildingId };
	if (projectId) where.projectId = projectId;

	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.iLike]: `%${keywords}%` };
	}

	let floors = await Floors.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(floors);
	await next();
});

/**
* @api {post} /api/floors 创建楼层
* @apiName floor-create
* @apiGroup 楼层
* @apiDescription 创建楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} name 楼层名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 楼层building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: data.buildingId };
	if (data.projectId) where.projectId = data.projectId;
	let building = await Buildings.findOne({ where });
	if (!data.name || !building) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let floor = await Floors.findOne({ where: { buildingId: data.buildingId, name: data.name } });
	if (floor) {
		ctx.body = ServiceResult.getFail('该楼房已经存在该楼层');
		return;
	}
	data.projectId = building.projectId;
	data.projectName = building.projectName;
	data.buildingName = building.name;
	data.oesv = 'sv';
	floor = await Floors.create(data);
	ctx.body = ServiceResult.getSuccess(floor);
	await next();
});

/**
* @api {get}  /api/floors/:id?projectId=&buildingId= 楼层信息
* @apiName floor-info
* @apiGroup 楼层
* @apiDescription 楼层信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {Number} [buildingId] 建筑id
* @apiParam {Number} id 楼层id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 楼层信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };
	if (ctx.query.projectId) where.projectId = ctx.query.projectId;
	if (ctx.query.buildingId) where.buildingId = ctx.query.buildingId;

	let floor = await Floors.findOne({ where });
	ctx.body = ServiceResult.getSuccess(floor);
	await next();
});

/**
* @api {put} /api/floors/:id 修改楼层
* @apiName floor-modify
* @apiGroup 楼层
* @apiDescription 修改楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 楼层id
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} [name] 楼层名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };
	if (data.projectId) where.projectId = data.projectId;
	if (data.buildingId) where.buildingId = data.buildingId;

	let floor = await Floors.findOne({ where });
	if (!floor) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	floor = await Floors.findOne({ where: { buildingId: floor.buildingId, name: data.name } });
	if (floor) {
		ctx.body = ServiceResult.getFail('该楼房中已经存在该楼层');
		return;
	}
	await Floors.update(data, { where });
	if (data.name) {
		await Spaces.update({ floorName: data.name }, { where: { floorId: ctx.params.id } });
	}
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/floors/:id 删除楼层
* @apiName floor-delete
* @apiGroup 楼层
* @apiDescription 删除楼层
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} id 楼层id
* @apiSuccess {Object} data 楼层building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };
	if (data.projectId) where.projectId = data.projectId;
	if (data.buildingId) where.buildingId = data.buildingId;

	await Floors.destroy({ where });
	await next();
});

module.exports = router;
