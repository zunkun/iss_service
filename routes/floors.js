const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const { Op } = require('sequelize');
const Constants = require('../models/Constants');

router.prefix('/api/floors');
/**
* @api {get} /api/floors?buildingId=&limit=&page=&keywords= 楼层列表
* @apiName floors-query
* @apiGroup 楼层
* @apiDescription 楼层列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} buildingId 建筑id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 楼层列表
* @apiSuccess {Number} data.id 楼层floor id
* @apiSuccess {String} data.name 楼层名称
* @apiSuccess {Number} data.floorClassId 楼层类别Id
* @apiSuccess {Object} data.floorClassId 楼层类别
* @apiSuccess {Date} data.activeStartDate 开始时间
* @apiSuccess {Boolean} data.floorMaintained 是否维护
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.grossarea 总面积
* @apiSuccess {Number} data.grossexternarea 外部面积
* @apiSuccess {Number} data.grossinternalarea 内部面积
* @apiSuccess {Number} data.level 楼层
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords, buildingId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	if (!buildingId) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let where = { buildingId };

	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.iLike]: `%${keywords}%` };
	}

	let floors = await Floors.findAndCountAll({
		where,
		limit,
		offset,
		include: [ { model: Constants, as: 'floorClass' } ]
	});
	ctx.body = ServiceResult.getSuccess(floors);
	await next();
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
* @apiParam {Boolean} [floorMaintained] 是否维护
* @apiParam {Number} [grossarea] 总面积
* @apiParam {Number} [grossexternarea] 外部面积
* @apiParam {Number} [grossinternalarea] 内部面积
* @apiParam {Number} [level] 楼层
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 楼层信息
* @apiSuccess {Number} data.id 楼层floor id
* @apiSuccess {String} data.name 楼层名称
* @apiSuccess {Number} data.floorClassId 楼层类别Id
* @apiSuccess {Object} data.floorClassId 楼层类别
* @apiSuccess {Date} data.activeStartDate 开始时间
* @apiSuccess {Boolean} data.floorMaintained 是否维护
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.grossarea 总面积
* @apiSuccess {Number} data.grossexternarea 外部面积
* @apiSuccess {Number} data.grossinternalarea 内部面积
* @apiSuccess {Number} data.level 楼层
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let building = await Buildings.findOne({ where: { id: data.buildingId || null } });
	if (!data.buildingId || !data.name || !building) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let floorData = { buildingId: data.buildingId, name: data.name, locationId: building.locationId, category: 0 };

	[ 'floorClassId', 'floorMaintained', 'description',
		'grossarea', 'grossexternarea', 'grossinternalarea', 'level'
	].map(key => {
		if (data[key]) floorData[key] = data[key];
	});

	return Floors.create(floorData)
		.then(floor => {
			return Floors.findOne({
				where: { id: floor.id },
				include: [
					{ model: Constants, as: 'floorClass' }
				]
			}).then(res => {
				ctx.body = ServiceResult.getSuccess(res);
				next();
			});
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
* @apiSuccess {Number} data.floorClassId 楼层类别Id
* @apiSuccess {Object} data.floorClassId 楼层类别
* @apiSuccess {Date} data.activeStartDate 开始时间
* @apiSuccess {Boolean} data.floorMaintained 是否维护
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.grossarea 总面积
* @apiSuccess {Number} data.grossexternarea 外部面积
* @apiSuccess {Number} data.grossinternalarea 内部面积
* @apiSuccess {Number} data.level 楼层
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };
	if (ctx.query.projectId) where.projectId = ctx.query.projectId;
	if (ctx.query.buildingId) where.buildingId = ctx.query.buildingId;

	return Floors.findOne({
		where,
		include: [
			{ model: Constants, as: 'floorClass' }
		]
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
* @apiParam {String} [description] 描述
* @apiParam {Number} [floorClassId] floorClass id 参看常量表
* @apiParam {Boolean} [floorMaintained] 是否维护
* @apiParam {Number} [grossarea] 总面积
* @apiParam {Number} [grossexternarea] 外部面积
* @apiParam {Number} [grossinternalarea] 内部面积
* @apiParam {Number} [level] 楼层
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };

	let floorData = {};
	[ 'name', 'floorClassId', 'floorMaintained', 'description',
		'grossarea', 'grossexternarea', 'grossinternalarea', 'level'
	].map(key => {
		if (data[key]) floorData[key] = data[key];
	});

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
* @api {delete} /api/floors/:id 删除楼层
* @apiName floor-delete
* @apiGroup 楼层
* @apiDescription 删除楼层
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 楼层id
* @apiSuccess {Object} data 楼层building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Floors.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('删除floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
