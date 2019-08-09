const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');
const SpaceService = require('../services/SpaceService');
const jwt = require('jsonwebtoken');
const constUtil = require('../core/util/constants');

router.prefix('/api/spaces');

/**
* @api {get} /api/spaces?floorId=&limit=&page=&name= 空间列表
* @apiName space-query
* @apiGroup 空间
* @apiDescription 空间列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} floorId 楼层id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [name] 空间名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间列表
* @apiSuccess {Number} data.count 空间縂數目
* @apiSuccess {Object[]} data.rows 当前页数据
* @apiSuccess {Number} data.rows.id 空间ID
* @apiSuccess {String} data.rows.floorId 楼层id
* @apiSuccess {String} data.rows.name 空间名称
* @apiSuccess {Number} data.rows.area 面积
* @apiSuccess {Number} data.rows.height 高度
* @apiSuccess {Number} data.rows.spaceClassId 空间类别ID
* @apiSuccess {String} data.rows.spaceClass 空间类别
* @apiSuccess {Number} data.rows.groundId 地面类型ID
* @apiSuccess {Number} data.rows.ground 地面类型
* @apiSuccess {Number} data.rows.materialId 材质ID
* @apiSuccess {Number} data.rows.material 材质
* @apiSuccess {Number} data.rows.wareNum 器具数量
* @apiSuccess {String} data.rows.description 描述
* @apiSuccess {Boolean} data.rows.isInner 是否是室内空间
* @apiSuccess {Boolean} data.rows.isMaintained 是否需要服务
* @apiSuccess {String} data.rows.createdUserId  创建人usrId
* @apiSuccess {String} data.rows.createdUserName  创建人userName
* @apiSuccess {Number} data.rows.status 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { floorId, page, limit, name } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { floorId };

	if (!floorId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	if (name) {
		where[Op.or] = [
			{ name: { [Op.iLike]: `%${name}%` } },
			{ pinyin: { [Op.iLike]: `%${name}%` } }
		];
	}

	return Spaces.findAndCountAll({ where, limit, offset })
		.then(spaces => {
			ctx.body = ServiceResult.getSuccess(spaces);
			next();
		}).catch(error => {
			console.error('获取空间列表事变', error);
			ctx.body = ServiceResult.getFail('获取空间列表事变');
			next();
		});
});

/**
* @api {post} /api/spaces 创建空间
* @apiName space-create
* @apiGroup 空间
* @apiDescription 创建空间
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} floorId 楼层id
* @apiParam {String} name 空间名称
* @apiParam {Number} [area] 面积
* @apiParam {Number} [height] 高度
* @apiParam {Number} [spaceClassId] 空间类别ID
* @apiParam {Number} [groundId] 地面类型ID
* @apiParam {Number} [materialId] 材质ID
* @apiParam {Number} [wareNum] 器具数量
* @apiParam {String} [description] 描述
* @apiParam {Boolean} [isInner] 是否是室内空间，默认否
* @apiParam {Boolean} [isMaintained] 是否需要服务，默认否
* @apiParam {Number} [status] 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 空间space
* @apiSuccess {Number} data.id 空间ID
* @apiSuccess {String} data.floorId 楼层id
* @apiSuccess {String} data.name 空间名称
* @apiSuccess {Number} data.area 面积
* @apiSuccess {Number} data.height 高度
* @apiSuccess {Number} data.spaceClassId 空间类别ID
* @apiSuccess {String} data.spaceClass 空间类别
* @apiSuccess {Number} data.groundId 地面类型ID
* @apiSuccess {Number} data.ground 地面类型
* @apiSuccess {Number} data.materialId 材质ID
* @apiSuccess {Number} data.material 材质
* @apiSuccess {Number} data.wareNum 器具数量
* @apiSuccess {String} data.description 描述
* @apiSuccess {Boolean} data.isInner 是否是室内空间
* @apiSuccess {Boolean} data.isMaintained 是否需要服务
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;
	if (!data.name || !data.floorId || !user.userId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	return SpaceService.saveSpace(data, user)
		.then(space => {
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
* @apiSuccess {Number} data.id 空间ID
* @apiSuccess {String} data.floorId 楼层id
* @apiSuccess {String} data.name 空间名称
* @apiSuccess {Number} data.area 面积
* @apiSuccess {Number} data.height 高度
* @apiSuccess {Number} data.spaceClassId 空间类别ID
* @apiSuccess {String} data.spaceClass 空间类别
* @apiSuccess {Number} data.groundId 地面类型ID
* @apiSuccess {Number} data.ground 地面类型
* @apiSuccess {Number} data.materialId 材质ID
* @apiSuccess {Number} data.material 材质
* @apiSuccess {Number} data.wareNum 器具数量
* @apiSuccess {String} data.description 描述
* @apiSuccess {Boolean} data.isInner 是否是室内空间
* @apiSuccess {Boolean} data.isMaintained 是否需要服务
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Spaces.findOne({ where, attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] } }).then(space => {
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
* @apiParam {String} [name] 空间名称
* @apiParam {Number} [area] 面积
* @apiParam {Number} [height] 高度
* @apiParam {Number} [spaceClassId] 空间类别ID
* @apiParam {Number} [groundId] 地面类型ID
* @apiParam {Number} [materialId] 材质ID
* @apiParam {Number} [wareNum] 器具数量
* @apiParam {String} [description] 描述
* @apiParam {Boolean} [isInner] 是否是室内空间，默认否
* @apiParam {Boolean} [isMaintained] 是否需要服务，默认否
* @apiParam {Number} [status] 当前数据分类 0-sv编辑 1-启用 2-启用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const where = { id: ctx.params.id };

	let spaceData = { };

	[ 'name', 'area', 'height', 'wareNum' ].map(key => {
		if (data[key]) spaceData[key] = data[key];
	});

	let keys = Object.keys(data);
	if (keys.indexOf('isInner')) spaceData.isInner = data.isInner;
	if (keys.indexOf('isMaintained')) spaceData.isMaintained = data.isMaintained;

	if (data.spaceClassId && constUtil.hasConst(data.spaceClassId)) {
		spaceData.spaceClassId = data.spaceClassId;
		spaceData.spaceClass = constUtil.getConst(data.spaceClassId);
	}

	if (data.groundId && constUtil.hasConst(data.groundId)) {
		spaceData.groundId = data.groundId;
		spaceData.ground = constUtil.getConst(data.groundId);
	}

	if (data.materialId && constUtil.hasConst(data.materialId)) {
		spaceData.materialId = data.materialId;
		spaceData.material = constUtil.getConst(data.materialId);
	}

	return Spaces.update(spaceData, { where	}).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('修改space失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {post} /api/spaces/status 设置当前状态
* @apiName spaces-status
* @apiGroup 空间
* @apiDescription 设置当前状态 当前空间数据状态 1-启用 2-停用中
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 空间id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/status', async (ctx, next) => {
	const { id, status } = ctx.request.body;

	return Spaces.update({ status: Number(status), where: { id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('设置空间当前状态失败', error);
			ctx.body = ServiceResult.getFail('设置失败');
			next();
		});
});

module.exports = router;
