const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');

router.prefix('/api/spaces');

/**
* @api {get} /api/spaces?projectId=&buildingId=&floorId=&limit=&page=&keywords= 空间列表
* @apiName space-query
* @apiGroup 空间
* @apiDescription 空间列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} floorId 楼层id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 空间列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { projectId, buildingId, floorId, page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { floorId };
	if (projectId) where.projectId = projectId;
	if (buildingId) where.buildingId = buildingId;

	if (!floorId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}

	let spaces = await Spaces.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(spaces);
	await next();
});

/**
* @api {post} /api/spaces 创建空间
* @apiName space-create
* @apiGroup 空间
* @apiDescription 创建空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} floorId 楼层id
* @apiParam {String} name 空间名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 空间building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: data.floorId };

	if (data.projectId) where.projectId = data.projectId;
	if (data.buildingId) where.buildingId = data.buildingId;
	let floor = await Floors.findOne({ where });
	if (!floor) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let space = await Spaces.findOne({ where: { floorId: data.floorId, name: data.name } });
	if (space) {
		ctx.body = ServiceResult.getFail('该楼层已经存在该房间');
		return;
	}

	data.projectId = floor.projectId;
	data.projectName = floor.projectName;
	data.buildingId = floor.buildingId;
	data.buildingName = floor.buildingName;
	data.floorId = floor.id;
	data.floorName = floor.name;
	data.oesv = 'sv';

	space = await Spaces.create(data);
	ctx.body = ServiceResult.getSuccess(space);
	await next();
});

/**
* @api {get} /api/spaces/:id?projectId=&buildingId=&floorId= 空间信息
* @apiName space-info
* @apiGroup 空间
* @apiDescription 空间信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {Number} [buildingId] 建筑id
* @apiParam {Number} [floorId] 楼层id
* @apiParam {Number} id 空间id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };
	const { projectId, buildingId, floorId } = ctx.query;
	if (projectId) where.projectId = projectId;
	if (buildingId) where.buildingId = buildingId;
	if (floorId) where.floorId = floorId;

	let space = await Spaces.findOne({ where });
	ctx.body = ServiceResult.getSuccess(space);
	await next();
});

/**
* @api {put} /api/spaces/:id 修改空间
* @apiName space-modify
* @apiGroup 空间
* @apiDescription 修改空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} [floorId] 楼层id
* @apiParam {Number} id 空间id
* @apiParam {String} [name] 空间名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };
	const { projectId, buildingId, floorId } = ctx.request.body;
	if (projectId) where.projectId = projectId;
	if (buildingId) where.buildingId = buildingId;
	if (floorId) where.floorId = floorId;

	let space = await Spaces.findOne({ where });
	if (!space) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	space = await Spaces.findOne({ where: { floorId: space.floorId, name: data.name } });
	if (space) {
		ctx.body = ServiceResult.getFail('该楼层已经存在该房间');
		return;
	}
	await Spaces.update(data, { where	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/spaces/:id 删除空间
* @apiName space-delete
* @apiGroup 空间
* @apiDescription 删除空间
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [projectId] 项目id
* @apiParam {String} [buildingId] 建筑id
* @apiParam {String} [floorId] 楼层id
* @apiParam {String} id 空间id
* @apiSuccess {Object} data 空间building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 空间删除其他表处理
	const where = { id: ctx.params.id };
	const { projectId, buildingId, floorId } = ctx.request.body;
	if (projectId) where.projectId = projectId;
	if (buildingId) where.buildingId = buildingId;
	if (floorId) where.floorId = floorId;

	await Spaces.destroy({ where });
	await next();
});

module.exports = router;
