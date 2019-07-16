const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Constants = require('../models/Constants');
const areaLists = require('../config/areaLists');
const { Op, fn, col } = require('sequelize');

router.prefix('/api/constants');

/**
* @api {get} /api/constants/classfication 常量分类表(保留)
* @apiName constants-classfication
* @apiGroup 常量
* @apiDescription 常量分类表
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {String[]} data 常量分类表
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.get('/classfication', async (ctx, next) => {
	return Constants.findAll({
		attributes: [
			[ fn('DISTINCT', col('classfication')), 'classfication' ]
		]
	}).then(constants => {
		let classfications = [];
		constants.map(constant => {
			classfications.push(constant.classfication);
		});
		ctx.body = ServiceResult.getSuccess(classfications);
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getSuccess([]);
		next();
	});
});

/**
* @api {get} /api/constants?classfication=&name=&category= 常量信息
* @apiName constants-query
* @apiGroup 常量
* @apiDescription 常量信息
* @apiParam {String} [classfication] 分类
* @apiParam {String} [name] 分类名称
* @apiParam {String} category 数据分类 1-使用中常量 2-归档常量，默认1
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 常量信息
* @apiSuccess {Number} data.id 常量id
* @apiSuccess {String} data.classfication 常量分类
* @apiSuccess {String} data.name 常量名称
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { classfication, name, category } = ctx.query;
	const where = { category: category || 1 };
	if (classfication) { where.classfication = { [Op.iLike]: `%${classfication}%` }; }

	if (name) { where.name = { [Op.iLike]: `%${name}%` }; }
	return Constants.findAll({
		attributes: [ 'id', 'classfication', 'name' ],
		where,
		raw: true
	}).then(constants => {
		ctx.body = ServiceResult.getSuccess(constants);
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getSuccess([]);
		next();
	});
});

/**
* @api {post} /api/constants 常量新增
* @apiName constants-create
* @apiGroup 常量
* @apiDescription 常量新增
* @apiParam {String} classfication 分类
* @apiParam {String} name 分类名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 常量信息
* @apiSuccess {Number} data.id 常量id
* @apiSuccess {String} data.classfication 常量分类
* @apiSuccess {String} data.name 常量名称
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const { classfication, name } = ctx.request.body;
	if (!classfication || !name) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	return Constants.findOne({
		where: {
			classfication,
			name
		}
	}).then(constant => {
		if (constant) {
			return constant;
		}
		return Constants.create({ name, classfication });
	}).then(constant => {
		ctx.body = ServiceResult.getSuccess({
			id: constant.id,
			name,
			classfication
		});
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getFail('创建错误');
		next();
	});
});

/**
* @api {put} /api/constants/:id 修改常量
* @apiName constants-update
* @apiGroup 常量
* @apiDescription 修改常量,只允许修改名称
* @apiParam {Number} id 常量id
* @apiParam {String} name 分类名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const { name } = ctx.request.body;

	return Constants.update({ name }, { where: { id: ctx.params.id } }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getFail('修改错误');
		next();
	});
});

/**
* @api {post} /api/constants/:id/archive 常量归类
* @apiName constants-archive
* @apiGroup 常量
* @apiDescription 常量归类
* @apiParam {Number} id 常量id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.post('/:id/archive', async (ctx, next) => {
	return Constants.update({ category: 2 }, { where: { id: ctx.params.id } }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getFail('归档失败');
		next();
	});
});

/**
* @api {get} /api/constants/area 地址信息
* @apiName area
* @apiGroup 常量
* @apiDescription 地址信息
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 地址信息
* @apiSuccess {String} data.value province code 省code
* @apiSuccess {String} data.label province name 省名称
* @apiSuccess {Object[]} data.children  城市列表
* @apiSuccess {String} data.children.value city code 城市code
* @apiSuccess {String} data.children.label city name 城市名称
* @apiSuccess {Object[]} data.children.children  区县列表
* @apiSuccess {String} data.children.children.value district code 区县code
* @apiSuccess {String} data.children.children.label district name 区县名称
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/area', async (ctx, next) => {
	ctx.body = ServiceResult.getSuccess(areaLists);
	next();
});

/**
* @api {get} /api/constants/:id 常量信息
* @apiName constants-info
* @apiGroup 常量
* @apiDescription 常量信息
* @apiParam {Number} id 常量id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 常量信息
* @apiSuccess {Number} data.id 常量id
* @apiSuccess {String} data.classfication 常量分类
* @apiSuccess {String} data.name 常量名称
* @apiError {Number} errcode 失败不为0
* @apiError {String} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Constants.findOne({
		attributes: [ 'id', 'classfication', 'name' ],
		where: { id: ctx.params.id }
	}).then((constant) => {
		ctx.body = ServiceResult.getSuccess(constant);
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getFail('获取失败');
		next();
	});
});

module.exports = router;
