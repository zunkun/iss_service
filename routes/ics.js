const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const FC = require('../models/FC');
const IC = require('../models/IC');

router.prefix('/api/fcs/:fcId/ics');

/**
* @api {get}/api/fcs/:fcId/ics 检查项列表
* @apiName ic-query
* @apiGroup 检查项
* @apiDescription 检查项列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 检查项列表
* @apiSuccess {String} data.name 检查项别
* @apiSuccess {Number} data.system 设备系统，查看常量中systemMap
* @apiSuccess {Number} data.description 设备描述
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	const fc = await FC.findOne({ where: { id: ctx.params.fcId } });
	if (!fc) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	const ics = await IC.findAll({ where: { fcId: ctx.params.fcId } });
	ctx.body = ServiceResult.getSuccess(ics);
	await next();
});

/**
* @api {post}/api/fcs/:fcId/ics 创建检查项
* @apiName ic-create
* @apiGroup 检查项
* @apiDescription 创建检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} projectId 项目id
* @apiParam {String} name 检查项目名称
* @apiParam {Number} datatype 录入数据类型 1-选择项目 2-信息录入
* @apiParam {String} [stateA] 状态A, datatype=== 1时填写
* @apiParam {String} [stateB] 状态B, datatype=== 1时填写
* @apiParam {String} [stateC] 状态C, datatype=== 1时填写
* @apiParam {String} [stateD] 状态D, datatype=== 1时填写
* @apiParam {Number} [normal] 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiParam {String} [unit] 录入数据单位，datatype=== 1时填写
* @apiParam {Number} [high] 上限，datatype=== 1时填写
* @apiParam {Number} [low] 下限，datatype=== 1时填写
* @apiParam {String} remark 备注
* @apiParam {Number} [frequency] 频率 参考常量中frequencyMap
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 检查项信息
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
		ctx.body = ServiceResult.getFail('已存在该检查项');
	}
	fc = await FC.create({ projectId, system, name, description });
	ctx.body = ServiceResult.getSuccess(fc);
	await next();
});

/**
* @api {get}/api/fcs/:fcId/ics/:id 检查项信息
* @apiName ic-info
* @apiGroup 检查项
* @apiDescription 检查项信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 检查项信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id, fcId: ctx.params.fcId };

	let ic = await IC.findOne({ where });
	ctx.body = ServiceResult.getSuccess(ic);
	await next();
});

/**
* @api {put}/api/fcs/:fcId/ics/:id 修改检查项
* @apiName ic-modify
* @apiGroup 检查项
* @apiDescription 修改检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 检查项id
* @apiParam {String} [name] 检查项名称
* @apiParam {String} [system] 设备系统
* @apiParam {String} [description] 检查项描述
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id, fcId: ctx.params.fcId };

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
* @api {delete}/api/fcs/:fcId/ics/:id 删除检查项
* @apiName ic-delete
* @apiGroup 检查项
* @apiDescription 删除检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 检查项删除其他表处理
	const where = { id: ctx.params.id, fcId: ctx.params.fcId };

	await IC.destroy({ where });
	await next();
});

module.exports = router;
