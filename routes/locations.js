const ServiceResult = require('../core/ServiceResult');
const Companies = require('../models/Companies');
const Locations = require('../models/Locations');

const { Op } = require('sequelize');
const Router = require('koa-router');
const LocationService = require('../services/LocationService');
const jwt = require('jsonwebtoken');
const constUtil = require('../core/util/constants');
const util = require('../core/util');
const router = new Router();
router.prefix('/api/locations');

/**
* @api {get} /api/locations?limit=&page=&name=&status=&createdUserName=&companyId=&companyName 项目点列表
* @apiName locations-query
* @apiGroup 项目点
* @apiDescription 项目点列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [companyId] 客户id
* @apiParam {String} [companyName] 客户名称
* @apiParam {String} [name]  项目点名称
* @apiParam {String} [createdUserName]  创建人
* @apiParam {Number} [status]  当前状态
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点Location列表
* @apiSuccess {Number} data.count 项目点Location总数
* @apiSuccess {Object[]} data.rows 项目点Location列表
* @apiSuccess {String} data.rows.id 项目点id标识
* @apiSuccess {String} data.rows.companyId 客户id
* @apiSuccess {Object} data.rows.companyName 客户名称
* @apiSuccess {String} data.rows.name 项目点名称
* @apiSuccess {String} data.rows.provinceCode 省份编码
* @apiSuccess {String} data.rows.provinceName 省份名称
* @apiSuccess {String} data.rows.cityCode 城市编码
* @apiSuccess {String} data.rows.cityName 城市名称
* @apiSuccess {String} data.rows.districtCode  区县编码
* @apiSuccess {String} data.rows.districtName  区县名称
* @apiSuccess {String} data.rows.street  地址详细
* @apiSuccess {String} data.rows.costcenter 项目编号（财务编号）
* @apiSuccess {Number} data.rows.area  总面积
* @apiSuccess {String} data.rows.unit  测量单位
* @apiSuccess {Number} data.rows.propertyClassId  类别Id
* @apiSuccess {String} data.rows.propertyClass  类别，参考常量表
* @apiSuccess {String} data.rows.description  描述
* @apiSuccess {String} data.rows.zippostal  邮编
* @apiSuccess {String} data.rows.mainphone  电话总机
* @apiSuccess {String} data.rows.parkingOpen  停车位数量
* @apiSuccess {String} data.rows.createdUserId  创建人usrId
* @apiSuccess {String} data.rows.createdUserName  创建人userName
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, name, companyId, companyName, createdUserName, status } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = { };
	// 根据项目点信息查询
	if (name) {
		where[Op.or] = [
			{ name: { [Op.iLike]: `%${name}%` } },
			{ pinyin: { [Op.iLike]: `%${name}%` } }
		];
	}
	// 根据创建人查询
	if (createdUserName) {
		where.createdUserName = { [Op.iLike]: `%${createdUserName}%` };
	}
	// 根据客户信息查询
	if (companyId) where.companyId = companyId;
	if (companyName) {
		where.companyName = { [Op.iLike]: `%${companyName}%` };
	}
	// 根据当前状态查询
	if (status === 0 || status) {
		where.status = status;
	}

	return Locations.findAndCountAll({
		where,
		limit,
		offset,
		attributes: { exclude: [ 'updatedAt', 'deletedAt' ] }
	}).then(locations => {
		ctx.body = ServiceResult.getSuccess(locations);
		next();
	}).catch(error => {
		console.error('获取项目点信息失败', error);
		ctx.body = ServiceResult.getFail('获取项目点信息失败');
		next();
	});
});

/**
* @api {post} /api/locations 创建项目点
* @apiName location-create
* @apiGroup 项目点
* @apiDescription 创建项目点
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} companyId 客户id
* @apiParam {String} name 项目点名称
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [costcenter] 项目编号（财务编号）
* @apiParam {Number} [area]  总面积
* @apiParam {String} [unit]  测量单位
* @apiParam {Number} [propertyClassId]  类别Id
* @apiParam {String} [description]  描述
* @apiParam {String} [zippostal]  邮编
* @apiParam {String} [mainphone]  电话总机
* @apiParam {String} [parkingOpen]  停车位数量
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点Location
* @apiSuccess {String} data.id 项目点id标识
* @apiSuccess {String} data.companyId 客户id
* @apiSuccess {Object} data.companyName 客户名称
* @apiSuccess {String} data.name 项目点名称
* @apiSuccess {String} data.provinceCode 省份编码
* @apiSuccess {String} data.provinceName 省份名称
* @apiSuccess {String} data.cityCode 城市编码
* @apiSuccess {String} data.cityName 城市名称
* @apiSuccess {String} data.districtCode  区县编码
* @apiSuccess {String} data.districtName  区县名称
* @apiSuccess {String} data.street  地址详细
* @apiSuccess {String} data.costcenter 项目编号（财务编号）
* @apiSuccess {Number} data.area  总面积
* @apiSuccess {String} data.unit  测量单位
* @apiSuccess {Number} data.propertyClassId  类别Id
* @apiSuccess {String} data.propertyClass  类别，参考常量表
* @apiSuccess {String} data.description  描述
* @apiSuccess {String} data.zippostal  邮编
* @apiSuccess {String} data.mainphone  电话总机
* @apiSuccess {String} data.parkingOpen  停车位数量
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;
	if (!data.name || !user.userId) {
		ctx.body = ServiceResult.getFail('保存失败');
		return;
	}

	return LocationService.saveLocation(data, user)
		.then(location => {
			ctx.body = ServiceResult.getSuccess(location);
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail('保存项目点信息失败', error);
			next();
		});
});

/**
* @api {get} /api/locations/:id 项目点信息
* @apiName locations-info
* @apiGroup 项目点
* @apiDescription 项目点信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 项目点id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点Location
* @apiSuccess {String} data.id 项目点id标识
* @apiSuccess {String} data.companyId 客户id
* @apiSuccess {Object} data.companyName 客户名称
* @apiSuccess {String} data.name 项目点名称
* @apiSuccess {String} data.provinceCode 省份编码
* @apiSuccess {String} data.provinceName 省份名称
* @apiSuccess {String} data.cityCode 城市编码
* @apiSuccess {String} data.cityName 城市名称
* @apiSuccess {String} data.districtCode  区县编码
* @apiSuccess {String} data.districtName  区县名称
* @apiSuccess {String} data.street  地址详细
* @apiSuccess {String} data.costcenter 项目编号（财务编号）
* @apiSuccess {Number} data.area  总面积
* @apiSuccess {String} data.unit  测量单位
* @apiSuccess {Number} data.propertyClassId  类别Id
* @apiSuccess {String} data.propertyClass  类别，参考常量表
* @apiSuccess {String} data.description  描述
* @apiSuccess {String} data.zippostal  邮编
* @apiSuccess {String} data.mainphone  电话总机
* @apiSuccess {String} data.parkingOpen  停车位数量
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let location = await Locations.findOne({
		where: { id: ctx.params.id },
		include: [
			{ model: Companies, as: 'company' }
		]
	});
	ctx.body = ServiceResult.getSuccess(location);
	await next();
});

/**
* @api {put} /api/locations/:id 修改项目点
* @apiName location-modify
* @apiGroup 项目点
* @apiDescription 修改项目点
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 项目点id
* @apiParam {String} [companyId] 客户id
* @apiParam {String} [name] 项目点名称
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [costcenter] 项目编号（财务编号）
* @apiParam {Number} [area]  总面积
* @apiParam {String} [unit]  测量单位
* @apiParam {Number} [propertyClassId]  类别Id
* @apiParam {String} [description]  描述
* @apiParam {String} [zippostal]  邮编
* @apiParam {String} [mainphone]  电话总机
* @apiParam {String} [parkingOpen]  停车位数量
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	let location = await Locations.findOne({ where: { id: ctx.params.id } });
	if (!location) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let locationData = {};
	// 复制基本信息
	util.setProperty([ 'name', 'costcenter', 'street', 'mainphone',
		'area', 'unit',	'zippostal', 'description', 'parkingOpen' ], data, locationData);

	if (data.propertyClassId && constUtil.hasConst(data.propertyClassId)) {
		locationData.propertyClassId = data.propertyClassId;
		locationData.propertyClass = constUtil.getConst(data.propertyClassId);
	}
	if (data.name) locationData.pinyin = util.getPinyin(data.name);
	// 处理省市区信息
	util.setZone(data, locationData);

	await Locations.update(locationData, { where: { id: ctx.params.id	}	});

	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {post} /api/locations/status 设置当前状态
* @apiName location-status
* @apiGroup 项目点
* @apiDescription 设置当前状态 当前项目点数据状态 1-启用 2-停用中
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 项目点id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/status', async (ctx, next) => {
	const { id, status } = ctx.request.body;

	return Locations.update({ status: Number(status), where: { id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('设置项目点当前状态失败', error);
			ctx.body = ServiceResult.getFail('设置失败');
			next();
		});
});

module.exports = router;
