const ServiceResult = require('../core/ServiceResult');
const Companies = require('../models/Companies');
const Locations = require('../models/Locations');
const Constants = require('../models/Constants');

const { Op } = require('sequelize');
const Router = require('koa-router');
const areaMap = require('../config/areaMap');

const router = new Router();
router.prefix('/api/locations');
let paranoid = true;

/**
* @api {get} /api/locations?limit=&page=&keywords=&provinceCode=&cityCode=&districtCode=&inuse= 位置列表
* @apiName locations-query
* @apiGroup 位置
* @apiDescription 位置列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [companyId] 客户id
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [code] 项目编号（财务编号）
* @apiParam {String} [commonName]  通用名称
* @apiParam {String} [costcenter]  成本中心
* @apiParam {Number} [areaUnitId]  单位id
* @apiParam {Number} [geographyLookupId]  城市-地理表Id
* @apiParam {Number} [primaryUseId]  主要用途Id
* @apiParam {Number} [propertyClassId]  类别Id
* @apiParam {String} [zippostal]  邮编
* @apiParam {String} [mainphone]  电话总机
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 位置location列表
* @apiSuccess {Number} data.count 位置location总数
* @apiSuccess {Object[]} data.rows 位置location列表
* @apiSuccess {String} data.rows.companyId 客户id
* @apiSuccess {Object} data.rows.company 客户信息
* @apiSuccess {String} data.rows.name 项目点名称
* @apiSuccess {String} data.rows.provinceCode 省份编码
* @apiSuccess {String} data.rows.provinceName 省份名称
* @apiSuccess {String} data.rows.cityCode 城市编码
* @apiSuccess {String} data.rows.cityName 城市名称
* @apiSuccess {String} data.rows.districtCode  区县编码
* @apiSuccess {String} data.rows.districtName  区县名称
* @apiSuccess {String} data.rows.street  地址详细
* @apiSuccess {String} data.rows.code 项目编号（财务编号）
* @apiSuccess {String} data.rows.commonName  通用名称
* @apiSuccess {String} data.rows.costcenter  成本中心
* @apiSuccess {Number} data.rows.areaUnitId  单位id
* @apiSuccess {Object} data.rows.areaUnit  单位
* @apiSuccess {Number} data.rows.currencyId  货币Id
* @apiSuccess {Object} data.rows.currency  货币
* @apiSuccess {Number} data.rows.geographyLookupId  城市-地理表Id
* @apiSuccess {Object} data.rows.geographyLookup  城市-地理表
* @apiSuccess {Number} data.rows.primaryUseId  主要用途Id
* @apiSuccess {Object} data.rows.primaryUse  主要用途
* @apiSuccess {Number} data.rows.propertyClassId  类别Id
* @apiSuccess {Object} data.rows.propertyClass  类别
* @apiSuccess {String} data.rows.description  描述
* @apiSuccess {String} data.rows.legalName  法律名称
* @apiSuccess {String} data.rows.zippostal  邮编
* @apiSuccess {String} data.rows.mainphone  电话总机
* @apiSuccess {String} data.rows.parkingOpen  停车位数量
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	let where = {};

	if (keywords && keywords !== 'undefined') {
		where[Op.or] = [
			{ code: { [Op.iLike]: `%${keywords}%` } },
			{ name: { [Op.iLike]: `%${keywords}%` } },
			{ companyName: { [Op.iLike]: `%${keywords}%` } }
		];
	}

	[ 'provinceCode', 'cityCode', 'districtCode', 'code', 'commonName', 'costcenter', 'areaUnitId', 'zippostal', 'mainphone' ].map(key => {
		if (ctx.query[key]) {
			where[key] = { [Op.iLike]: `%${key}%` };
		}
	});
	[ 'companyId', 'areaUnitId', 'geographyLookupId', 'primaryUseId', 'propertyClassId' ].map(key => {
		if (ctx.query[key]) {
			where[key] = key;
		}
	});

	let locations = await Locations.findAndCountAll({
		where,
		limit,
		offset,
		include: [
			{ model: Companies, as: 'company' },
			{ model: Constants, as: 'areaUnit', paranoid, attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'currency', paranoid, attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'geographyLookup', paranoid, attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'primaryUse', paranoid, attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'propertyClass', paranoid, attributes: [ 'id', 'classfication', 'name' ] }
		]
	});
	ctx.body = ServiceResult.getSuccess(locations);
	await next();
});

/**
* @api {post} /api/locations 创建位置
* @apiName location-create
* @apiGroup 位置
* @apiDescription 创建位置
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} companyId 客户id
* @apiParam {String} name 项目点名称
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [code] 项目编号（财务编号）
* @apiParam {String} [commonName]  通用名称
* @apiParam {String} [costcenter]  成本中心
* @apiParam {Number} [areaUnitId]  单位id
* @apiParam {Number} [currencyId]  货币Id
* @apiParam {Number} [geographyLookupId]  城市-地理表Id
* @apiParam {Number} [primaryUseId]  主要用途Id
* @apiParam {Number} [propertyClassId]  类别Id
* @apiParam {String} [description]  描述
* @apiParam {String} [legalName]  法律名称
* @apiParam {String} [zippostal]  邮编
* @apiParam {String} [mainphone]  电话总机
* @apiParam {String} [parkingOpen]  停车位数量
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 位置location
* @apiSuccess {String} data.companyId 客户id
* @apiSuccess {Object} data.company 客户信息
* @apiSuccess {String} data.name 项目点名称
* @apiSuccess {String} data.provinceCode 省份编码
* @apiSuccess {String} data.provinceName 省份名称
* @apiSuccess {String} data.cityCode 城市编码
* @apiSuccess {String} data.cityName 城市名称
* @apiSuccess {String} data.districtCode  区县编码
* @apiSuccess {String} data.districtName  区县名称
* @apiSuccess {String} data.street  地址详细
* @apiSuccess {String} data.code 项目编号（财务编号）
* @apiSuccess {String} data.commonName  通用名称
* @apiSuccess {String} data.costcenter  成本中心
* @apiSuccess {Number} data.areaUnitId  单位id
* @apiSuccess {Object} data.areaUnit  单位
* @apiSuccess {Number} data.currencyId  货币Id
* @apiSuccess {Object} data.currency  货币
* @apiSuccess {Number} data.geographyLookupId  城市-地理表Id
* @apiSuccess {Object} data.geographyLookup  城市-地理表
* @apiSuccess {Number} data.primaryUseId  主要用途Id
* @apiSuccess {Object} data.primaryUse  主要用途
* @apiSuccess {Number} data.propertyClassId  类别Id
* @apiSuccess {Object} data.propertyClass  类别
* @apiSuccess {String} data.description  描述
* @apiSuccess {String} data.legalName  法律名称
* @apiSuccess {String} data.zippostal  邮编
* @apiSuccess {String} data.mainphone  电话总机
* @apiSuccess {String} data.parkingOpen  停车位数量
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let company = await Companies.findOne({ where: { id: data.companyId || null } });
	if (!data.companyId || !company || !data.name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	data.provinceName = areaMap.province[data.provinceCode];
	data.cityName = areaMap.city[data.cityCode];
	data.districtName = areaMap.district[data.districtCode];

	let location = await Locations.create(data, { raw: true });

	location = await Locations.findOne({
		where: { id: location.id },
		include: [
			{ model: Companies, as: 'company' },
			{ model: Constants, as: 'areaUnit', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'currency', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'geographyLookup', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'primaryUse', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'propertyClass', attributes: [ 'id', 'classfication', 'name' ] }
		]
	});
	ctx.body = ServiceResult.getSuccess(location);
	await next();
});

/**
* @api {get} /api/locations/:id 位置信息
* @apiName locations-info
* @apiGroup 位置
* @apiDescription 位置信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 位置id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 位置信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let location = await Locations.findOne({
		where: { id: ctx.params.id },
		include: [
			{ model: Companies, as: 'company' },
			{ model: Constants, as: 'areaUnit', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'currency', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'geographyLookup', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'primaryUse', attributes: [ 'id', 'classfication', 'name' ] },
			{ model: Constants, as: 'propertyClass', attributes: [ 'id', 'classfication', 'name' ] }
		]
	});
	ctx.body = ServiceResult.getSuccess(location);
	await next();
});

/**
* @api {put} /api/locations/:id 修改位置
* @apiName location-modify
* @apiGroup 位置
* @apiDescription 修改位置
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 位置id
* @apiParam {String} [companyId] 客户id
* @apiParam {String} [name] 项目点名称
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [code] 项目编号（财务编号）
* @apiParam {String} [commonName]  通用名称
* @apiParam {String} [costcenter]  成本中心
* @apiParam {Number} [areaUnitId]  单位id
* @apiParam {Number} [currencyId]  货币Id
* @apiParam {Number} [geographyLookupId]  城市-地理表Id
* @apiParam {Number} [primaryUseId]  主要用途Id
* @apiParam {Number} [propertyClassId]  类别Id
* @apiParam {String} [description]  描述
* @apiParam {String} [legalName]  法律名称
* @apiParam {String} [zippostal]  邮编
* @apiParam {String} [mainphone]  电话总机
* @apiParam {String} [parkingOpen]  停车位数量
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const body = ctx.request.body;
	let location = await Locations.findOne({ where: { id: ctx.params.id } });
	if (!location) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	await Locations.update(body, {
		where: {
			id: ctx.params.id
		}
	});

	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/locations/:id 删除位置
* @apiName location-delete
* @apiGroup 位置
* @apiDescription 删除位置
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 位置id
* @apiSuccess {Object} data 位置location
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	await Locations.destroy({ where: { id: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

module.exports = router;
