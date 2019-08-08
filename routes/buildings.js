const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Buildings = require('../models/Buildings');
const Constants = require('../models/Constants');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const BuildingService = require('../services/building');
const util = require('../core/util');

router.prefix('/api/buildings');
/**
* @api {get} /api/buildings?locationId=&limit=&page=&name= 建筑列表
* @apiName buildings-query
* @apiGroup 建筑
* @apiDescription 建筑列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [name] 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑列表
* @apiSuccess {Number} data.count 建筑列表count
* @apiSuccess {Object} data.rows 建筑building
* @apiSuccess {Number} data.rows.id 建筑building id
* @apiSuccess {String} data.rows.name 建筑名称
* @apiSuccess {Number} data.rows.locationId 项目点id
* @apiSuccess {Number} data.rows.buildingClassId 建筑类别Id
* @apiSuccess {Object} data.rows.buildingClass 建筑类别
* @apiSuccess {String} data.rows.description 描述
* @apiSuccess {String} data.rows.mainphone 电话总机
* @apiSuccess {Number} data.rows.status 当前数据分类 0-sv编辑的数据 1-启用 2-弃用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, name, locationId } = ctx.query;

	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	if (!locationId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { locationId };
	if (name && name !== 'undefined') {
		where[Op.or] = [
			{ name: { [Op.like]: `%${name}%` } },
			{ pinyin: { [Op.like]: `%${name}%` } }
		];
	}

	return Buildings.findAndCountAll({
		where,
		limit,
		offset,
		attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] },
		include: [
			{ model: Constants, as: 'buildingClass' }
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
* @apiParam {String} [description] 描述
* @apiParam {String} [mainphone] 电话总机
* @apiParam {Number} [status] 当前数据分类 0-sv编辑的数据 1-启用 2-弃用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 建筑building
* @apiSuccess {Number} data.id 建筑building id
* @apiSuccess {String} data.name 建筑名称
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Number} data.buildingClassId 建筑类别Id
* @apiSuccess {Object} data.buildingClass 建筑类别
* @apiSuccess {String} data.description 描述
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑的数据 1-启用 2-弃用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;

	return BuildingService.saveBuilding(data, user)
		.then(building => {
			return Buildings.findOne({
				attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] },
				where: { id: building.id },
				include: [
					{ model: Constants, as: 'buildingClass' }
				]
			}).then(res => {
				ctx.body = ServiceResult.getSuccess(res);
				next();
			}).catch(error => {
				console.log('创建建筑信息失败', error);
				ctx.body = ServiceResult.getFail('执行错误');
				next();
			});
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
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Number} data.buildingClassId 建筑类别Id
* @apiSuccess {Object} data.buildingClass 建筑类别
* @apiSuccess {String} data.description 描述
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑的数据 1-启用 2-弃用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Buildings.findOne({
		attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] },
		where: { id: ctx.params.id },
		include: [
			{ model: Constants, as: 'buildingClass' }
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
* @apiParam {String} [description] 描述
* @apiParam {String} [mainphone] 电话总机
* @apiParam {Number} [status] 当前数据分类 1-启用 2-弃用
* @apiParam {String} name 建筑名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;

	let buildingData = {};
	util.setProperty([ 'name', 'buildingClassId', 'description', 'mainphone' ], data, buildingData);
	if (data.status) buildingData.status = data.status;
	if (data.name) buildingData.pinyin = util.getPinyin(data.name);

	return Buildings.update(buildingData, { where: { id: ctx.params.id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.log('更新building失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {post} /api/buildings/status 设置当前状态
* @apiName buildings-status
* @apiGroup 项目点
* @apiDescription 设置当前状态 当前建筑数据状态 1-启用 2-停用中
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 建筑id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/status', async (ctx, next) => {
	const { id, status } = ctx.request.body;

	return Buildings.update({ status: Number(status), where: { id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('设置建筑当前状态失败', error);
			ctx.body = ServiceResult.getFail('设置失败');
			next();
		});
});
module.exports = router;
