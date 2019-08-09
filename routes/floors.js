const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Floors = require('../models/Floors');
const { Op } = require('sequelize');
const FloorService = require('../services/FloorService');
const jwt = require('jsonwebtoken');
const util = require('../core/util');
const constUtil = require('../core/util/constants');

router.prefix('/api/floors');
/**
* @api {get} /api/floors?buildingId=&limit=&page=&name= 楼层列表
* @apiName floors-query
* @apiGroup 楼层
* @apiDescription 楼层列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} buildingId 建筑id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [name] 楼层名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 楼层列表
* @apiSuccess {Number} data.count 楼层总数
* @apiSuccess {Object[]} data.rows 楼层列表
* @apiSuccess {Number} data.rows.id 楼层floor id
* @apiSuccess {String} data.rows.name 楼层名称
* @apiSuccess {Number} data.rows.level 楼层
* @apiSuccess {Number} data.rows.floorClassId 楼层类别Id
* @apiSuccess {String} data.rows.floorClass 楼层类别
* @apiSuccess {Date} data.rows.activeStartDate 开始时间
* @apiSuccess {Boolean} data.rows.isMaintained 是否维护
* @apiSuccess {String} data.rows.description 描述
* @apiSuccess {Number} data.rows.area 总面积
* @apiSuccess {Number} data.rows.outerarea 外部面积
* @apiSuccess {Number} data.rows.innerarea 内部面积
* @apiSuccess {Number} data.rows.level 楼层
* @apiSuccess {String} data.rows.createdUserId  创建人usrId
* @apiSuccess {String} data.rows.createdUserName  创建人userName
* @apiSuccess {Number} data.rows.status 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, name, buildingId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	if (!buildingId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { buildingId };

	if (name && name !== 'undefined') {
		where[Op.or] = [
			{ name: { [Op.iLike]: `%${name}%` } },
			{ pinyin: { [Op.iLike]: `%${name}%` } }
		];
	}

	return Floors.findAndCountAll({
		where,
		limit,
		offset,
		attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] }
	}).then(floors => {
		ctx.body = ServiceResult.getSuccess(floors);
		next();
	}).catch(error => {
		console.error('获取楼层列表失败', error);
		ctx.body = ServiceResult.getFail('获取楼层列表失败');
		next();
	});
});

/**
* @api {post} /api/floors 创建楼层
* @apiName floor-create
* @apiGroup 楼层
* @apiDescription 创建楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} buildingId 建筑id
* @apiParam {String} name 楼层名称
* @apiParam {String} [description] 描述
* @apiParam {Number} [floorClassId] floorClass id 参看常量表
* @apiParam {Boolean} [isMaintained] 是否维护
* @apiParam {Number} [area] 总面积
* @apiParam {Number} [outerarea] 外部面积
* @apiParam {Number} [innerarea] 内部面积
* @apiParam {Number} [level] 楼层
* @apiParam {Number} [status] 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 楼层信息
* @apiSuccess {Number} data.id 楼层floor id
* @apiSuccess {String} data.name 楼层名称
* @apiSuccess {Number} ldata.evel 楼层
* @apiSuccess {Number} data.floorClassId 楼层类别Id
* @apiSuccess {String} data.floorClass 楼层类别
* @apiSuccess {Boolean} data.isMaintained 是否维护
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.area 总面积
* @apiSuccess {Number} data.outerarea 外部面积
* @apiSuccess {Number} data.innerarea 内部面积
* @apiSuccess {Number} data.level 楼层
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;

	return FloorService.saveFloor(data, user)
		.then(res => {
			ctx.body = ServiceResult.getSuccess(res);
			next();
		}).catch(error => {
			console.log('创建floor失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {get}  /api/floors/:id 楼层信息
* @apiName floor-info
* @apiGroup 楼层
* @apiDescription 楼层信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 楼层id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 楼层信息
* @apiSuccess {Number} data.id 楼层floor id
* @apiSuccess {String} data.name 楼层名称
* @apiSuccess {Number} ldata.evel 楼层
* @apiSuccess {Number} data.floorClassId 楼层类别Id
* @apiSuccess {String} data.floorClass 楼层类别
* @apiSuccess {Boolean} data.isMaintained 是否维护
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.area 总面积
* @apiSuccess {Number} data.outerarea 外部面积
* @apiSuccess {Number} data.innerarea 内部面积
* @apiSuccess {Number} data.level 楼层
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Floors.findOne({
		where,
		attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] }
	}).then(res => {
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.log('查询floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {put} /api/floors/:id 修改楼层
* @apiName floor-modify
* @apiGroup 楼层
* @apiDescription 修改楼层
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 楼层id
* @apiParam {String} [name] 楼层名称
* @apiParam {Number} [level] 楼层
* @apiParam {String} [description] 描述
* @apiParam {Number} [floorClassId] floorClass id 参看常量表
* @apiParam {Boolean} [isMaintained] 是否维护
* @apiParam {Number} [area] 总面积
* @apiParam {Number} [outerarea] 外部面积
* @apiParam {Number} [innerarea] 内部面积
* @apiParam {Number} [status] 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };

	let floorData = {};
	util.setProperty([ 'name', 'description',
		'area', 'outerarea', 'innerarea', 'level'
	], data, floorData);

	if (data.floorClassId && constUtil.hasConst(data.floorClassId)) {
		floorData.floorClassId = data.floorClassId;
		floorData.floorClass = constUtil.getConst(data.floorClassId);
	}

	if (Object.keys(data).indexOf('isMaintained') > -1) floorData.isMaintained = data.isMaintained;
	if (data.name) floorData.pinyin = util.getPinyin(data.name);
	if (data.status) floorData.status = data.status;

	return Floors.update(floorData, { where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('修改floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {post} /api/floors/status 设置当前状态
* @apiName floor-status
* @apiGroup 项目点
* @apiDescription 设置当前状态 当前楼层数据状态 1-启用 2-停用中
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 楼层id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/status', async (ctx, next) => {
	const { id, status } = ctx.request.body;

	return Floors.update({ status: Number(status), where: { id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('设置楼层当前状态失败', error);
			ctx.body = ServiceResult.getFail('设置失败');
			next();
		});
});

module.exports = router;
