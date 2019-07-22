const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');

router.prefix('/api/spaces');

/**
* @api {get} /api/spaces?floorId=&limit=&page=&keywords= 空间列表
* @apiName space-query
* @apiGroup 空间
* @apiDescription 空间列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} floorId 楼层id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间列表
* @apiSuccess {Number} data.count 空间縂數目
* @apiSuccess {Object[]} data.rows 当前页数据
* @apiSuccess {String} data.rows.name 空间名称
* @apiSuccess {String} data.rows.barcodeentry 编号
* @apiSuccess {Number} data.rows.area 面积
* @apiSuccess {Number} data.rows.extwindowarea 室外面积
* @apiSuccess {Number} data.rows.inwindowarea 室内面积
* @apiSuccess {Number} data.rows.spaceheight 空间高度
* @apiSuccess {Number} data.rows.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { floorId, page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { floorId };

	if (!floorId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}

	let spaces = await Spaces.findAndCountAll({ where, limit, offset });
	ctx.body = ServiceResult.getSuccess(spaces);
	await next();
});

/**
* @api {post} /api/spaces 创建空间
* @apiName space-create
* @apiGroup 空间
* @apiDescription 创建空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} floorId 楼层id
* @apiParam {String} name 空间名称
* @apiParam {Number} [area] 面积
* @apiParam {String} [barcodeentry] 编号
* @apiParam {Number} [extwindowarea] 室外面积
* @apiParam {Number} [inwindowarea] 室内面积
* @apiParam {Number} [spaceheight] 空间高度
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间space
* @apiSuccess {String} data.name 空间名称
* @apiSuccess {String} data.barcodeentry 编号
* @apiSuccess {Number} data.area 面积
* @apiSuccess {Number} data.extwindowarea 室外面积
* @apiSuccess {Number} data.inwindowarea 室内面积
* @apiSuccess {Number} data.spaceheight 空间高度
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;

	return Floors.findOne({
		where: { id: data.floorId || null }
	}).then((floor) => {
		if (!data.floorId || !floor || !data.name) {
			return Promise.reject('参数错误');
		}
		let spaceData = {
			name: data.name,
			locationId: floor.locationId,
			locationUuid: floor.locationUuid,
			buildingId: floor.buildingId,
			buildingUuid: floor.buildingUuid,
			floorId: floor.id,
			floorUuid: floor.uuid,
			category: 0
		};

		[ 'barcodeentry', 'area', 'extwindowarea', 'inwindowarea', 'spaceheight' ].map(key => {
			if (data[key]) spaceData[key] = data[key];
		});

		return Spaces.create(spaceData);
	}).then(space => {
		ctx.body = ServiceResult.getSuccess(space);
		next();
	}).catch(error => {
		console.log('创建floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {get} /api/spaces/:id 空间信息
* @apiName space-info
* @apiGroup 空间
* @apiDescription 空间信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 空间id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间space
* @apiSuccess {String} data.name 空间名称
* @apiSuccess {String} data.barcodeentry 编号
* @apiSuccess {Number} data.area 面积
* @apiSuccess {Number} data.extwindowarea 室外面积
* @apiSuccess {Number} data.inwindowarea 室内面积
* @apiSuccess {Number} data.spaceheight 空间高度
* @apiSuccess {Number} data.category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Spaces.findOne({ where, attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] } }).then(space => {
		ctx.body = ServiceResult.getSuccess(space);
		next();
	}).catch(error => {
		console.log('创建floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {put} /api/spaces/:id 修改空间
* @apiName space-modify
* @apiGroup 空间
* @apiDescription 修改空间
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 空间id
* @apiParam {String} [name] 空间名称
* @apiParam {Number} [area] 面积
* @apiParam {String} [barcodeentry] 编号
* @apiParam {Number} [extwindowarea] 室外面积
* @apiParam {Number} [inwindowarea] 室内面积
* @apiParam {Number} [spaceheight] 空间高度
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };

	let spaceData = { };

	[ 'name', 'barcodeentry', 'area', 'extwindowarea', 'inwindowarea', 'spaceheight' ].map(key => {
		if (data[key]) spaceData[key] = data[key];
	});

	return Spaces.update(spaceData, { where	}).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('创建floor失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {delete} /api/spaces/:id 删除空间
* @apiName space-delete
* @apiGroup 空间
* @apiDescription 删除空间
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 空间id
* @apiSuccess {Object} data 空间building
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Spaces.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('删除space失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
