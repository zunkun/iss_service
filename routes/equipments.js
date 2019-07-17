const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Specs = require('../models/Specs');
const Equipments = require('../models/Equipments');
const Inspections = require('../models/Inspections');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const Constants = require('../models/Constants');

const { Op } = require('sequelize');

// 设备录入管理
router.prefix('/api/equipments');

/**
* @api {get} /api/equipments?barcodeEntry=&name=&conditionId=&grpassetcriticalityId=&serialNum=&locationId=&buildingId=&floorId=&spaceId=&limit=&page=&keywords=&category=&activeStartDate= 设备录入列表
* @apiName equipments-query
* @apiGroup 设备录入
* @apiDescription 设备录入列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} category 当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据, 默认0
* @apiParam {String} [barcodeEntry] 设备code
* @apiParam {String} [activeStartDate] 生效日期
* @apiParam {String} [name] 设备名称
* @apiParam {String} [nameplate] 名牌
* @apiParam {Number} [conditionId] 设备系统id
* @apiParam {Number} [grpassetcriticalityId] 设备类id
* @apiParam {Number} [locationId] 项目点id
* @apiParam {Number} [buildingId] 楼房id
* @apiParam {Number} [floorId] 楼层id
* @apiParam {Number} [spaceId] 空间id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [status] 设备状态 1-编辑中 2-已提交
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 录入设备列表
* @apiSuccess {Number} data.count 设备总数
* @apiSuccess {Object[]} data.rows 当前页设备列表
* @apiSuccess {Number} data.rows.id 设备录入id
* @apiSuccess {String} data.rows.name 设备录入别
* @apiSuccess {String} data.rows.barcodeEntry 设备编码
* @apiSuccess {String} data.rows.description 描述
* @apiSuccess {Number} data.rows.conditionId 状况Id,参考常量表constants
* @apiSuccess {String} data.rows.condition 状况
* @apiSuccess {Number} data.rows.grpassetcriticalityId 重要程度ID,参考常量表constants
* @apiSuccess {String} data.rows.nameplate 名牌
* @apiSuccess {String} data.rows.power 功率
* @apiSuccess {String} data.rows.remarks 备注
* @apiSuccess {Number} data.rows.serialNum 序列号
* @apiSuccess {Number} data.rows.quantity 数量
* @apiSuccess {Number} data.rows.specId 设备类id
* @apiSuccess {Object} data.rows.spec 设备类
* @apiSuccess {Number} data.rows.parentAssetId 父设备id
* @apiSuccess {Object} data.rows.parsentAsset 父设备
* @apiSuccess {Number} data.rows.buildingId buildingId
* @apiSuccess {Object} data.rows.building building信息
* @apiSuccess {Number} data.rows.floorId floorId
* @apiSuccess {Object} data.rows.floor floor信息
* @apiSuccess {Number} data.rows.spaceId spaceId
* @apiSuccess {Object} data.rows.space space信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let query = ctx.query;
	let page = Number(query.page) || 1;
	let limit = Number(query.limit) || 10;
	let offset = (page - 1) * limit;
	const where = { category: Number(query.category) || 0 };
	let keywords = query.keywords;
	if (keywords && keywords !== 'undefined') {
		where[Op.or] = [];
		where[Op.or].push({ name: { [Op.like]: `%${keywords}%` } });
		where[Op.or].push({ barcodeEntry: { [Op.like]: `%${keywords}%` } });
		where[Op.or].push({ description: { [Op.like]: `%${keywords}%` } });
		where[Op.or].push({ nameplate: { [Op.like]: `%${keywords}%` } });
		where[Op.or].push({ remarks: { [Op.like]: `%${keywords}%` } });
		where[Op.or].push({ serialNum: { [Op.like]: `%${keywords}%` } });
	}
	[ 'locationId', 'buildingId', 'floorId', 'spaceId', 'name', 'activeStartDate',
		'barcodeEntry', 'conditionId', 'grpassetcriticalityId', 'nameplate', 'serialNum' ].map(key => {
		if (query[key]) where[key] = query[key];
	});

	return Equipments.findAndCountAll({
		where,
		limit,
		offset,
		include: [
			{ model: Specs, as: 'spec' },
			{ model: Buildings, as: 'building' },
			{ model: Floors, as: 'floor' },
			{ model: Spaces, as: 'space' },
			{ model: Constants, as: 'condition' },
			{ model: Constants, as: 'grpassetcriticality' },
			{ model: Equipments, as: 'parentAsset' }
		]
	}).then(equipments => {
		ctx.body = ServiceResult.getSuccess(equipments);
		next();
	}).catch(error => {
		console.error(error);
		ctx.body = ServiceResult.getFail('获取设备列表失败');
		next();
	});
});

/**
* @api {post} /api/equipments 创建设备录入
* @apiName equipments-create
* @apiGroup 设备录入
* @apiDescription 创建设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} spaceId 空间id
* @apiParam {Number} specId 设备类Id
* @apiParam {String} name 设备录入名称
* @apiParam {String} barcodeEntry 设备编码
* @apiParam {String} [description] 描述
* @apiParam {Number} [conditionId] 状况Id
* @apiParam {Number} [grpassetcriticalityId] 重要程度,参考常量表constants
* @apiParam {String} [nameplate] 名牌
* @apiParam {Number} [parentAssetId] 父设备Id
* @apiParam {String} [power] 功率
* @apiParam {Number} [quantity] 数量,默认1
* @apiParam {String} [remarks] 备注
* @apiParam {String} [serialNum] 序列号
* @apiParam {Boolean} [inspect] 是否巡检，默认不巡检
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备录入信息
* @apiSuccess {Number} data.id 设备录入id
* @apiSuccess {String} data.name 设备录入别
* @apiSuccess {String} data.barcodeEntry 设备编码
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.conditionId 状况Id,参考常量表constants
* @apiSuccess {String} data.condition 状况
* @apiSuccess {Number} data.grpassetcriticalityId 重要程度ID,参考常量表constants
* @apiSuccess {String} data.nameplate 名牌
* @apiSuccess {String} data.power 功率
* @apiSuccess {String} data.remarks 备注
* @apiSuccess {Number} data.serialNum 序列号
* @apiSuccess {Number} data.quantity 数量
* @apiSuccess {Number} data.specId 设备类id
* @apiSuccess {Object} data.spec 设备类
* @apiSuccess {Number} data.parentAssetId 父设备id
* @apiSuccess {Object} data.parsentAsset 父设备
* @apiSuccess {Number} data.buildingId buildingId
* @apiSuccess {Object} data.building building信息
* @apiSuccess {Number} data.floorId floorId
* @apiSuccess {Object} data.floor floor信息
* @apiSuccess {Number} data.spaceId spaceId
* @apiSuccess {Object} data.space space信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let space = await Spaces.findOne({ where: { id: data.spaceId || null } });
	let spec = await Specs.findOne({ where: { id: data.specId || null } });
	if (!data.spaceId || !space || !data.specId || !spec || !data.name || !data.barcodeEntry) {
		ctx.body = ServiceResult.getSuccess('参数不正确');
		return;
	}

	let equipmentData = {
		locationId: space.locationId,
		buildingId: space.buildingId,
		floorId: space.floorId,
		spaceId: space.id,
		specId: spec.id,
		name: data.name,
		barcodeEntry: data.barcodeEntry,
		inspect: !!data.inspect,
		category: 0
	};

	[ 'description', 'conditionId', 'grpassetcriticalityId', 'remarks',
		'nameplate', 'parentAssetId', 'power', 'quantity', 'serialNum' ].map(key => {
		if (data[key]) equipmentData[key] = data[key];
	});

	equipmentData.quantity = equipmentData.quantity || 1;

	return Equipments.create(equipmentData)
		.then((equipment) => {
			return Equipments.findOne({
				where: { id: equipment.id },
				include: [
					{ model: Specs, as: 'spec' },
					{ model: Buildings, as: 'building' },
					{ model: Floors, as: 'floor' },
					{ model: Spaces, as: 'space' },
					{ model: Constants, as: 'condition' },
					{ model: Constants, as: 'grpassetcriticality' },
					{ model: Equipments, as: 'parentAsset' }
				]
			}).then((_equipment) => {
				ctx.body = ServiceResult.getSuccess(_equipment);
				next();
			});
		}).catch(error => {
			console.log(error);
			ctx.body = ServiceResult.getFail('录入设备信息失败');
		});
});

/**
* @api {get} /api/equipments/:id 设备录入信息
* @apiName equipments-info
* @apiGroup 设备录入
* @apiDescription 设备录入信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备录入id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备录入信息
* @apiSuccess {Number} data.id 设备录入id
* @apiSuccess {String} data.name 设备录入别
* @apiSuccess {String} data.barcodeEntry 设备编码
* @apiSuccess {String} data.description 描述
* @apiSuccess {Number} data.conditionId 状况Id,参考常量表constants
* @apiSuccess {String} data.condition 状况
* @apiSuccess {Number} data.grpassetcriticalityId 重要程度ID,参考常量表constants
* @apiSuccess {String} data.nameplate 名牌
* @apiSuccess {String} data.power 功率
* @apiSuccess {String} data.remarks 备注
* @apiSuccess {Number} data.serialNum 序列号
* @apiSuccess {Number} data.quantity 数量
* @apiSuccess {Number} data.specId 设备类id
* @apiSuccess {Object} data.spec 设备类
* @apiSuccess {Number} data.parentAssetId 父设备id
* @apiSuccess {Object} data.parsentAsset 父设备
* @apiSuccess {Number} data.buildingId buildingId
* @apiSuccess {Object} data.building building信息
* @apiSuccess {Number} data.floorId floorId
* @apiSuccess {Object} data.floor floor信息
* @apiSuccess {Number} data.spaceId spaceId
* @apiSuccess {Object} data.space space信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Equipments.findOne({
		where: { id: ctx.params.id },
		include: [
			{ model: Specs, as: 'spec' },
			{ model: Buildings, as: 'building' },
			{ model: Floors, as: 'floor' },
			{ model: Spaces, as: 'space' },
			{ model: Constants, as: 'condition' },
			{ model: Constants, as: 'grpassetcriticality' },
			{ model: Equipments, as: 'parentAsset' }
		]
	}).then((equipment) => {
		ctx.body = ServiceResult.getSuccess(equipment);
		next();
	}).catch(error => {
		console.log(error);
		ctx.body = ServiceResult.getFail('查询录入信息失败');
	});
});

/**
* @api {put} /api/equipments/:id 修改设备录入
* @apiName equipments-modify
* @apiGroup 设备录入
* @apiDescription 修改设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备录入id
* @apiParam {Number} [specId] 设备类Id
* @apiParam {String} [name] 设备录入名称
* @apiParam {String} [barcodeEntry] 设备编码
* @apiParam {String} [description] 描述
* @apiParam {Number} [conditionId] 状况Id
* @apiParam {Number} [grpassetcriticalityId] 重要程度,参考常量表constants
* @apiParam {String} [nameplate] 名牌
* @apiParam {Number} [parentAssetId] 父设备Id
* @apiParam {String} [power] 功率
* @apiParam {Number} [quantity] 数量,默认1
* @apiParam {String} [remarks] 备注
* @apiParam {String} [serialNum] 序列号
* @apiParam {Boolean} [inspect] 是否巡检，默认不巡检
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;

	let equipmentData = {};
	if (Object.keys(data).indexOf('inspect') > -1) {
		equipmentData.inspect = !!data.inspect;
	}

	[ 'specId', 'name', 'description', 'conditionId', 'grpassetcriticalityId', 'remarks',
		'nameplate', 'parentAssetId', 'power', 'quantity', 'serialNum' ].map(key => {
		if (data[key]) equipmentData[key] = data[key];
	});

	return Equipments.update(equipmentData, { where: { id: ctx.params.id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('修改equipment失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {delete} /api/equipments/:id 删除设备录入
* @apiName equipments-delete
* @apiGroup 设备录入
* @apiDescription 删除设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 设备录入id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Equipments.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.error('删除equipment失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
