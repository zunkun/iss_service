const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Locations = require('../models/Locations');
const Buildings = require('../models/Buildings');
const Constants = require('../models/Constants');
const { Op } = require('sequelize');

router.prefix('/api/buildings');
/**
* @api {get} /api/buildings?locationId=&limit=&page=&keywords= 建筑列表
* @apiName buildings-query
* @apiGroup 建筑
* @apiDescription 建筑列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑列表
* @apiSuccess {Number} data.count 建筑列表count
* @apiSuccess {Object} data.rows 建筑building
* @apiSuccess {Number} data.rows.id 建筑building id
* @apiSuccess {String} data.rows.name 建筑名称
* @apiSuccess {Number}  data.rows.buildingClassId 建筑类别Id
* @apiSuccess {Object}  data.rows.buildingClass 建筑类别
* @apiSuccess {Date}  data.rows.activeStartDate 开始时间
* @apiSuccess {String}  data.rows.address 地址信息
* @apiSuccess {String}  data.rows.commonName 通用名称
* @apiSuccess {String}  data.rows.costcenter 成本中心
* @apiSuccess {String}  data.rows.description 描述
* @apiSuccess {String}  data.rows.legalName 法律名称
* @apiSuccess {String}  data.rows.mainfax 传真
* @apiSuccess {String}  data.rows.mainphone 电话总机
* @apiSuccess {Number}  data.rows.parkingOpen 停车位数量
* @apiSuccess {String}  data.rows.primaryUseId 主要用途Id
* @apiSuccess {Object}  data.rows.primaryUse 主要用途
* @apiSuccess {Number}  data.rows.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords, locationId } = ctx.query;

	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	if (!locationId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { locationId };
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}

	return Buildings.findAndCountAll({
		where,
		limit,
		offset,
		attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] },
		include: [
			{ model: Constants, as: 'buildingClass' },
			{ model: Constants, as: 'primaryUse' }
		]
	}).then(buildings => {
		ctx.body = ServiceResult.getSuccess(buildings);
		next();
	}).catch((error) => {
		console.log('查询building失败', error);
		ctx.body = ServiceResult.getFail('查询失败');
		next();
	});
});

/**
* @api {post} /api/buildings 创建建筑
* @apiName building-create
* @apiGroup 建筑
* @apiDescription 创建建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {String} name 建筑名称
* @apiParam {Number} [buildingClassId] 建筑类别Id
* @apiParam {Date} [activeStartDate] 开始时间
* @apiParam {String} [address] 地址信息
* @apiParam {String} [commonName] 通用名称
* @apiParam {String} [costcenter] 成本中心
* @apiParam {String} [description] 描述
* @apiParam {String} [legalName] 法律名称
* @apiParam {String} [mainfax] 传真
* @apiParam {String} [mainphone] 电话总机
* @apiParam {Number} [parkingOpen] 停车位数量
* @apiParam {String} [primaryUseId] 主要用途Id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} data.id 建筑building id
* @apiSuccess {String} data.name 建筑名称
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Number} data.buildingClassId 建筑类别Id
* @apiSuccess {Object} data.buildingClass 建筑类别
* @apiSuccess {Date} data.activeStartDate 开始时间
* @apiSuccess {String} data.address 地址信息
* @apiSuccess {String} data.commonName 通用名称
* @apiSuccess {String} data.costcenter 成本中心
* @apiSuccess {String} data.description 描述
* @apiSuccess {String} data.legalName 法律名称
* @apiSuccess {String} data.mainfax 传真
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {Number} data.parkingOpen 停车位数量
* @apiSuccess {String} data.primaryUseId 主要用途Id
* @apiSuccess {Object} data.primaryUse 主要用途
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let location = await Locations.findOne({ where: { id: data.locationId || null } });
	if (!data.name || !data.locationId || !location) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let buildingData = { locationId: data.locationId, locationUuid: location.uuid, name: data.name, category: 0 };

	[ 'activeStartDate', 'buildingClassId', 'address',
		'commonName', 'costcenter', 'description', 'legalName',
		'mainfax', 'mainphone', 'parkingOpen', 'primaryUseId'
	].map(key => {
		if (data[key]) { buildingData[key] = data[key]; }
	});

	return Buildings.create(buildingData)
		.then(building => {
			return Buildings.findOne({
				attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt', 'locationUuid' ] },
				where: { id: building.id },
				include: [
					{ model: Constants, as: 'buildingClass' },
					{ model: Constants, as: 'primaryUse' }
				]
			}).then(res => {
				ctx.body = ServiceResult.getSuccess(res);
				next();
			});
		}).catch(error => {
			console.log('创建building失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {get} /api/buildings/:id 建筑信息
* @apiName building-info
* @apiGroup 建筑
* @apiDescription 建筑信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 建筑id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} data.id 建筑building id
* @apiSuccess {String} data.name 建筑名称
* @apiSuccess {Number} data.buildingClassId 建筑类别Id
* @apiSuccess {Object} data.buildingClass 建筑类别
* @apiSuccess {Date} data.activeStartDate 开始时间
* @apiSuccess {String} data.address 地址信息
* @apiSuccess {String} data.commonName 通用名称
* @apiSuccess {String} data.costcenter 成本中心
* @apiSuccess {String} data.description 描述
* @apiSuccess {String} data.legalName 法律名称
* @apiSuccess {String} data.mainfax 传真
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {Number} data.parkingOpen 停车位数量
* @apiSuccess {String} data.primaryUseId 主要用途Id
* @apiSuccess {Object} data.primaryUse 主要用途
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Buildings.findOne({
		where: { id: ctx.params.id },
		include: [
			{ model: Constants, as: 'buildingClass' },
			{ model: Constants, as: 'primaryUse' }
		]
	}).then(res => {
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.log('查询building失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {put} /api/buildings/:id 修改建筑
* @apiName building-modify
* @apiGroup 建筑
* @apiDescription 修改建筑
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 建筑id
* @apiParam {String} [name] 建筑名称
* @apiParam {Number} [buildingClassId] 建筑类别Id
* @apiParam {Date} [activeStartDate] 开始时间
* @apiParam {String} [address] 地址信息
* @apiParam {String} [commonName] 通用名称
* @apiParam {String} [costcenter] 成本中心
* @apiParam {String} [description] 描述
* @apiParam {String} [legalName] 法律名称
* @apiParam {String} [mainfax] 传真
* @apiParam {String} [mainphone] 电话总机
* @apiParam {Number} [parkingOpen] 停车位数量
* @apiParam {String} [primaryUseId] 主要用途Id
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;

	let buildingData = {};
	[ 'name', 'activeStartDate', 'buildingClassId', 'address',
		'commonName', 'costcenter', 'description', 'legalName',
		'mainfax', 'mainphone', 'parkingOpen', 'primaryUseId'
	].map(key => {
		if (data[key]) { buildingData[key] = data[key]; }
	});

	return Buildings.findOne({ where: { id: ctx.params.id } })
		.then(building => {
			if (!building) {
				ctx.body = ServiceResult.getFail('');
				next();
			}
			return Buildings.update(buildingData, { where: { id: ctx.params.id } });
		}).then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.log('更新building失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {delete} /api/buildings/:id 删除建筑
* @apiName building-delete
* @apiGroup 建筑
* @apiDescription 删除建筑
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 建筑id
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Buildings.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('删除building失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
