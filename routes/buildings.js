const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isAdmin, isOE } = require('../core/auth');
const Projects = require('../models/Projects');
const Buildings = require('../models/Buildings');

router.prefix('/api/projects/:projectId/buildings');
/**
* @api {get} /api/projects/:projectId/buildings?limit=&page=&keywords=&industryCode= 建筑列表
* @apiName buildings-query
* @apiGroup 建筑
* @apiDescription 建筑列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 建筑列表
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

	let buildings = await Buildings.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(buildings);
	await next();
});

/**
* @api {post} /api/projects/:projectId/buildings 创建建筑
* @apiName building-create
* @apiGroup 建筑
* @apiDescription 创建建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 建筑building
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let project = await Projects.findOne({ where: { id: ctx.params.projectId } });
	if (!data.name || !project) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	data.projectId = ctx.params.projectId;
	data.projectName = project.name;

	let building = await Buildings.create(data);
	ctx.body = ServiceResult.getSuccess(building);
	await next();
});

/**
* @api {put} /api/projects/:projectId/buildings/:id 修改建筑
* @apiName building-modify
* @apiGroup 建筑
* @apiDescription 修改建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 建筑id
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isAdmin(), async (ctx, next) => {
	const data = ctx.request.body;
	let project = await Projects.findOne({ where: { id: ctx.params.projectId } });
	if (!data.name || !project) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await Buildings.update({ name: data.name }, {
		where: {
			id: ctx.params.id,
			projectId: ctx.params.projectId
		}
	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/projects/:projectId/buildings/:id 删除建筑
* @apiName building-delete
* @apiGroup 建筑
* @apiDescription 删除建筑
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 建筑id
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 建筑删除其他表处理
	await Buildings.destroy({ where: { id: ctx.params.id, projectId: ctx.params.projectId } });
	await next();
});

module.exports = router;
