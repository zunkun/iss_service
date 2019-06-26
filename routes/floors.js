const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isAdmin, isOE } = require('../core/auth');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');

router.prefix('/api/projects/:projectId/buildings/:buildingId/floors');
/**
* @api {get} /api/projects/:projectId/buildings/:buildingId/floors?limit=&page=&keywords= 楼层列表
* @apiName floors-query
* @apiGroup 楼层
* @apiDescription 楼层列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
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

	let floors = await Floors.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(floors);
	await next();
});

/**
* @api {post} /api/projects/:projectId/buildings/:buildingId/floors 创建楼层
* @apiName floor-create
* @apiGroup 楼层
* @apiDescription 创建楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} name 楼层名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 楼层building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let building = await Buildings.findOne({ where: { projectId: ctx.params.projectId, id: ctx.params.buildingId } });
	if (!data.name || !building) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	data.projectId = ctx.params.projectId;
	data.projectName = building.projectName;
	data.buildingId = ctx.params.buildingId;
	data.buildingName = building.name;

	let floor = await Floors.create(data);
	ctx.body = ServiceResult.getSuccess(floor);
	await next();
});

/**
* @api {put} /api/projects/:projectId/buildings/:buildingId/floors/:id 修改楼层
* @apiName floor-modify
* @apiGroup 楼层
* @apiDescription 修改楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 楼层id
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} [name] 楼层名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let floor = await Floors.findOne({
		where: {
			id: ctx.params.id,
			projectId: ctx.params.projectId,
			buildingId: ctx.params.buildingId
		}
	});
	if (!floor) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await Floors.update(data, {
		where: {
			id: ctx.params.id
		}
	});
	if (data.name) {
		await Spaces.update({ floorName: data.name }, { where: { floorId: ctx.params.id } });
	}
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/projects/:projectId/buildings/:buildingId/floors/:id 删除楼层
* @apiName floor-delete
* @apiGroup 楼层
* @apiDescription 删除楼层
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} buildingId 建筑id
* @apiParam {String} id 楼层id
* @apiSuccess {Object} data 楼层building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 楼层删除其他表处理
	await Floors.destroy({ where: { id: ctx.params.id, projectId: ctx.params.projectId, buildingId: ctx.params.buildingId } });
	await next();
});

module.exports = router;
