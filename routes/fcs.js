const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const FC = require('../models/FC');
const { Op } = require('sequelize');

router.prefix('/api/fcs');

/**
* @api {get} /api/fcs?projectId=&limit=&page=&keywords= 设备类列表
* @apiName fcs-query
* @apiGroup 设备类
* @apiDescription 设备类列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 设备类列表
* @apiSuccess {String} data.name 设备类别
* @apiSuccess {Number} data.system 设备系统，查看常量中systemMap
* @apiSuccess {Number} data.description 设备描述
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { projectId, page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { projectId };

	if (!projectId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}

	let fcs = await FC.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(fcs);
	await next();
});

/**
* @api {post} /api/fcs 创建设备类
* @apiName fcs-create
* @apiGroup 设备类
* @apiDescription 创建设备类
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} name 设备类别
* @apiParam {Number} system 设备系统，参考常量中 systemMap
* @apiParam {Number} [description] 描述信息
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类信息
* @apiSuccess {Object} data.id 设备类id
* @apiSuccess {Object} data.name 设备类别
* @apiSuccess {Object} data.system 设备类系统
* @apiSuccess {Object} data.projectId 设备类projectId
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isOE(), async (ctx, next) => {
	const { projectId, system, name, description } = ctx.request.body;
	if (!projectId || !system || !name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	const where = { projectId, system, name };
	let fc = await FC.findOne({ where });
	if (fc) {
		ctx.body = ServiceResult.getFail('已存在该设备类');
	}
	fc = await FC.create({ projectId, system, name, description });
	ctx.body = ServiceResult.getSuccess(fc);
	await next();
});

/**
* @api {get} /api/fcs/:id 设备类信息
* @apiName fcs-info
* @apiGroup 设备类
* @apiDescription 设备类信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类信息
* @apiSuccess {Object} data.id 设备类id
* @apiSuccess {Object} data.name 设备类别
* @apiSuccess {Object} data.system 设备类系统
* @apiSuccess {Object} data.projectId 设备类projectId
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	let fc = await FC.findOne({ where });
	ctx.body = ServiceResult.getSuccess(fc);
	await next();
});

/**
* @api {put} /api/fcs/:id 修改设备类
* @apiName fcs-modify
* @apiGroup 设备类
* @apiDescription 修改设备类
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类id
* @apiParam {String} [name] 设备类名称
* @apiParam {String} [system] 设备系统
* @apiParam {String} [description] 设备类描述
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };

	let fc = await FC.findOne({ where });
	if (!fc) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await FC.update(data, { where	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/fcs/:id 删除设备类
* @apiName fcs-delete
* @apiGroup 设备类
* @apiDescription 删除设备类
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 设备类id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 设备类删除其他表处理
	const where = { id: ctx.params.id };

	await FC.destroy({ where });
	await next();
});

module.exports = router;
