const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isAdmin, isOE } = require('../core/auth');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');

router.prefix('/api/projects/:projectId/buildings/:buildingId/floors/:floorId/spaces');

/**
* @api {get} /api/projects/:projectId/buildings/:buildingId/floors/:floorId/spaces?limit=&page=&keywords= 空间列表
* @apiName space-query
* @apiGroup 空间
* @apiDescription 空间列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
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
	let { page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { $or: [] };
	if (keywords && keywords !== 'undefined') {
		let regex = new RegExp(keywords, 'i');
		where.$or = where.$or.concat([
			{ name: { $regex: regex } }
		]);
	}
	where.projectId = ctx.params.projectId;
	where.buildingId = ctx.params.buildingId;
	where.floorId = ctx.params.floorId;

	let spaces = await Spaces.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(spaces);
	await next();
});

/**
* @api {post} /api/projects/:projectId/buildings/:buildingId/floors/:floorId/spaces 创建空间
* @apiName space-create
* @apiGroup 空间
* @apiDescription 创建空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} floorId 楼层id
* @apiParam {String} name 空间名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 空间building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let floor = await Floors.findOne({ where: { projectId: ctx.params.projectId, floorId: ctx.params.floorId, id: ctx.params.buildingId } });
	if (!floor) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	data.projectId = ctx.params.projectId;
	data.projectName = floor.projectName;
	data.buildingId = ctx.params.buildingId;
	data.buildingName = floor.name;
	data.floorId = ctx.params.floorId;
	data.floorName = ctx.params.floorName;

	let space = await Spaces.create(data);
	ctx.body = ServiceResult.getSuccess(space);
	await next();
});

/**
* @api {get} /api/projects/:id/buildings/:buildingId/floors/:floorId/spaces/:id 空间信息
* @apiName space-info
* @apiGroup 空间
* @apiDescription 空间信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {Number} buildingId 建筑id
* @apiParam {Number} buildingId 楼层id
* @apiParam {Number} id 空间id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let space = await Spaces.findOne({ where: { projectId: ctx.params.projectId, buildingId: ctx.params.buildingId, floorId: ctx.params.floorId, id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess(space);
	await next();
});

/**
* @api {put} /api/projects/:projectId/buildings/:buildingId/floors/:floorId/spaces/:id 修改空间
* @apiName space-modify
* @apiGroup 空间
* @apiDescription 修改空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} floorId 楼层id
* @apiParam {Number} id 空间id
* @apiParam {String} [name] 空间名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let space = await Spaces.findOne({
		where: {
			id: ctx.params.id,
			projectId: ctx.params.projectId,
			buildingId: ctx.params.buildingId,
			floorId: ctx.params.floorId
		}
	});
	if (!space) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await Spaces.update(data, {
		where: {
			id: ctx.params.id
		}
	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/projects/:projectId/buildings/:buildingId/floors/:floorId/spaces/:id 删除空间
* @apiName space-delete
* @apiGroup 空间
* @apiDescription 删除空间
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} floorId 楼层id
* @apiParam {String} id 空间id
* @apiSuccess {Object} data 空间building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 空间删除其他表处理
	await Spaces.destroy({ where: { id: ctx.params.id, projectId: ctx.params.projectId, buildingId: ctx.params.buildingId, floorId: ctx.params.floorId } });
	await next();
});

module.exports = router;
