const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Specs = require('../models/Specs');
const Inspections = require('../models/Inspections');
const Constants = require('../models/Constants');
const { Op } = require('sequelize');

router.prefix('/api/specs');

/**
* @api {get} /api/specs?name=&system=&limit=&page=&keywords= 设备类列表
* @apiName specs-query
* @apiGroup 设备类
* @apiDescription 设备类列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [name] 设备类名称
* @apiParam {Number} [system] 设备类系统
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类信息
* @apiSuccess {Number} data.count 设备类总数
* @apiSuccess {Object[]} data.rows 当前页设备类列表
* @apiSuccess {Number} data.rows.id 设备类id
* @apiSuccess {String} data.rows.name 设备类名称
* @apiSuccess {String} data.rows.description 描述
* @apiSuccess {Number} data.rows.brandId 品牌编号ID，参考constants
* @apiSuccess {Number} data.rows.brand 品牌编号
* @apiSuccess {Number} data.rows.buildingSystemId 建筑系统分类id，参考constants
* @apiSuccess {Number} data.rows.buildingSystem 建筑系统分类
* @apiSuccess {Number} data.rows.serviceClassId 服务类别id，参考constants
* @apiSuccess {Number} data.rows.serviceClass 服务类别
* @apiSuccess {Number} data.rows.specClassId 规格分类id，参考constants
* @apiSuccess {Number} data.rows.specClass 规格分类
* @apiSuccess {Object[]} data.rows.inspections 检查项目
* @apiSuccess {Number} data.rows.inspections.id 检查项目id
* @apiSuccess {String} data.rows.inspections.name 检查项目名称
* @apiSuccess {String} data.rows.inspections.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.rows.inspections.stateA 状态A
* @apiSuccess {String} data.rows.inspections.stateB 状态B
* @apiSuccess {String} data.rows.inspections.stateC 状态C
* @apiSuccess {String} data.rows.inspections.stateD 状态D
* @apiSuccess {String} data.rows.inspections.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.rows.inspections.unit 录入数据单位
* @apiSuccess {String} data.rows.inspections.high 上限
* @apiSuccess {String} data.rows.inspections.low 下限
* @apiSuccess {String} data.rows.inspections.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { name, page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	const where = {};
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}
	if (name) where.name = name;

	return Specs.findAndCountAll({
		where,
		limit,
		offset,
		include: [
			{ model: Constants, as: 'brand' },
			{ model: Constants, as: 'buildingSystem' },
			{ model: Constants, as: 'serviceClass' },
			{ model: Constants, as: 'specClass' },
			{ model: Inspections, as: 'inspections' }
		]
	}).then(res => {
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.log('创建spec失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {post} /api/specs 创建设备类
* @apiName specs-create
* @apiGroup 设备类
* @apiDescription 创建设备类
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} name 分类名称
* @apiParam {String} [description] 描述
* @apiParam {Number} [brandId] 品牌编号ID，参考constants
* @apiParam {Number} [buildingSystemId] 建筑系统分类id，参考constants
* @apiParam {Number} [serviceClassId] 服务类别id，参考constants
* @apiParam {Number} [specClassId] 规格分类id，参考constants
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类信息
* @apiSuccess {Number} data.id 设备类id
* @apiSuccess {String} data.name 设备类名称
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.brandId 品牌编号ID，参考constants
* @apiSuccess {Number} data.brand 品牌编号
* @apiSuccess {Number} data.buildingSystemId 建筑系统分类id，参考constants
* @apiSuccess {Number} data.buildingSystem 建筑系统分类
* @apiSuccess {Number} data.serviceClassId 服务类别id，参考constants
* @apiSuccess {Number} data.serviceClass 服务类别
* @apiSuccess {Number} data.specClassId 规格分类id，参考constants
* @apiSuccess {Number} data.specClass 规格分类
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	if (!data.name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let specData = { name: data.name };
	[ 'description', 'brandId', 'serviceClassId', 'buildingSystemId', 'specClassId' ].map(key => {
		if (data[key]) specData[key] = data[key];
	});
	return Specs.create(specData)
		.then(spec => {
			return Specs.findOne({
				where: { id: spec.id },
				include: [
					{ model: Constants, as: 'brand' },
					{ model: Constants, as: 'buildingSystem' },
					{ model: Constants, as: 'serviceClass' },
					{ model: Constants, as: 'specClass' }
				]
			});
		}).then(res => {
			ctx.body = ServiceResult.getSuccess(res);
			next();
		}).catch(error => {
			console.log('创建spec失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {get} /api/specs/:id 设备类信息
* @apiName specs-info
* @apiGroup 设备类
* @apiDescription 设备类信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类信息
* @apiSuccess {Number} data.id 设备类id
* @apiSuccess {String} data.name 设备类名称
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.brandId 品牌编号ID，参考constants
* @apiSuccess {Number} data.brand 品牌编号
* @apiSuccess {Number} data.buildingSystemId 建筑系统分类id，参考constants
* @apiSuccess {Number} data.buildingSystem 建筑系统分类
* @apiSuccess {Number} data.serviceClassId 服务类别id，参考constants
* @apiSuccess {Number} data.serviceClass 服务类别
* @apiSuccess {Number} data.specClassId 规格分类id，参考constants
* @apiSuccess {Number} data.specClass 规格分类
* @apiSuccess {Object[]} data.inspections 检查项目
* @apiSuccess {Number} data.inspections.id 检查项目id
* @apiSuccess {String} data.inspections.name 检查项目名称
* @apiSuccess {String} data.inspections.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.inspections.stateA 状态A
* @apiSuccess {String} data.inspections.stateB 状态B
* @apiSuccess {String} data.inspections.stateC 状态C
* @apiSuccess {String} data.inspections.stateD 状态D
* @apiSuccess {String} data.inspections.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.inspections.unit 录入数据单位
* @apiSuccess {String} data.inspections.high 上限
* @apiSuccess {String} data.inspections.low 下限
* @apiSuccess {String} data.inspections.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Specs.findOne({
		where,
		include: [
			{ model: Constants, as: 'brand' },
			{ model: Constants, as: 'buildingSystem' },
			{ model: Constants, as: 'serviceClass' },
			{ model: Constants, as: 'specClass' },
			{ model: Inspections, as: 'inspections' }
		]
	}).then(res => {
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.log('创建spec失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {put} /api/specs/:id 修改设备类
* @apiName specs-modify
* @apiGroup 设备类
* @apiDescription 修改设备类
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类id
* @apiParam {String} [name] 分类名称
* @apiParam {String} [description] 描述
* @apiParam {Number} [brandId] 品牌编号ID，参考constants
* @apiParam {Number} [buildingSystemId] 建筑系统分类id，参考constants
* @apiParam {Number} [serviceClassId] 服务类别id，参考constants
* @apiParam {Number} [specClassId] 规格分类id，参考constants
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };
	let specData = { };
	[ 'name', 'description', 'brandId', 'serviceClassId', 'buildingSystemId', 'specClassId' ].map(key => {
		if (data[key]) specData[key] = data[key];
	});

	return Specs.update(data, { where	}).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('更新spec失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {delete} /api/specs/:id 删除设备类
* @apiName specs-delete
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
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Specs.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('删除设备类失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
