const ServiceResult = require('../core/ServiceResult');
const Pathways = require('../models/Pathways');
const pathwayService = require('../services/pathways');
const Companies = require('../models/Companies');
const PathEquipments = require('../models/PathEquipments');
const PathInspections = require('../models/PathInspections');
const Equipments = require('../models/Equipments');
const Inspections = require('../models/Inspections');
const Personnels = require('../models/Personnels');
const moment = require('moment');
const { Op } = require('sequelize');
const Locations = require('../models/Locations');
const Buildings = require('../models/Buildings');
const jwt = require('jsonwebtoken');

const Router = require('koa-router');

const router = new Router();
router.prefix('/api/pathways');

/**
* @api {post} /api/pathways 创建巡检路线
* @apiName pathways-create
* @apiGroup 巡检路线
* @apiDescription 创建巡检路线
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {String} name 路线名称
* @apiParam {String} [description] 路线说明
* @apiParam {Object[]} equipments 路线中设备列表
* @apiParam {Number} equipments.id 设备id
* @apiParam {Number[]} equipments.inspections 巡检路线设备中检查项， 比如[1, 2, 3]
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检路线信息
* @apiSuccess {String} data.uuid 巡检路线标识的uuid
* @apiSuccess {String} data.name 巡检路线名称
* @apiSuccess {String} data.description 巡检路线说明
* @apiSuccess {Boolean} data.inuse 是否启用 true-启用 false-弃用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const { locationId, name, description, equipments } = ctx.request.body;
	if (!locationId || !name || !Array.isArray(equipments) || !equipments.length) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	for (let equipment of equipments) {
		if (!equipment.id || !Array.isArray(equipment.inspections) || !equipment.inspections.length) {
			ctx.body = ServiceResult.getFail('参数不正确');
			return;
		}
	}

	let pathwayData = { name, description, pathcode: moment().format('YYYYMMDDHHMMssSSS'), category: 1, inuse: true };

	return pathwayService.setPathways(locationId, pathwayData, equipments).then(pathway => {
		ctx.body = ServiceResult.getSuccess({ uuid: pathway.uuid, name, description });
		next();
	}).catch(error => {
		ctx.body = ServiceResult.getFail(error);
		next();
	});
});

/**
* @api {put} /api/pathways 修改巡检路线
* @apiName pathways-modify
* @apiGroup 巡检路线
* @apiDescription 修改巡检路线
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiParam {String} [name] 路线名称
* @apiParam {String} [description] 路线说明
* @apiParam {Object[]} equipments 路线中设备列表
* @apiParam {Number} equipments.id 设备id
* @apiParam {Number[]} equipments.inspections 巡检路线设备中检查项， 比如[1, 2, 3]
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检路线
* @apiSuccess {String} data.uuid 巡检路线标识的uuid
* @apiSuccess {String} data.name 巡检路线名称
* @apiSuccess {String} data.description 巡检路线说明
* @apiSuccess {Boolean} data.inuse 是否启用 true-启用 false-弃用
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/', async (ctx, next) => {
	const { uuid, name, description, equipments } = ctx.request.body;
	if (!uuid || !Array.isArray(equipments) || !equipments.length) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	for (let equipment of equipments) {
		if (!equipment.id || !Array.isArray(equipment.inspections) || !equipment.inspections.length) {
			ctx.body = ServiceResult.getFail('参数不正确');
			return;
		}
	}

	return Pathways.findOne({ where: { uuid, category: 1 } })
		.then((pathway) => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}
			let pathwayData = { uuid, name: name || pathway.name, description: description || pathway.description, pathcode: moment().format('YYYYMMDDHHMMssSSS'), category: 1, inuse: true };
			return pathwayService.updatePathway(uuid, pathwayData, equipments);
		}).then(pathway => {
			ctx.body = ServiceResult.getSuccess({ uuid: pathway.uuid, name, description });
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {post} /api/pathways/inuse 启用弃用巡检路线
* @apiName pathways-inuse
* @apiGroup 巡检路线
* @apiDescription 启用弃用巡检路线
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiParam {Boolean} inuse true-启用 false-弃用
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/inuse', async (ctx, next) => {
	const data = ctx.request.body;
	if (!data.uuid) {
		ctx.body = ServiceResult.getFail('参数不正确2');
		return;
	}

	return Pathways.findOne({ where: { uuid: data.uuid, category: 1 } })
		.then((pathway) => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}
			return Pathways.update({ inuse: !!data.inuse }, { where: { id: pathway.id } });
		}).then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {delete} /api/pathways 删除巡检路线
* @apiName pathways-delete
* @apiGroup 巡检路线
* @apiDescription 删除巡检路线
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/', async (ctx, next) => {
	const data = ctx.request.body;
	if (!data.uuid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	return Pathways.findOne({ where: { uuid: data.uuid, category: 1 } })
		.then((pathway) => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}
			return Pathways.destroy({ where: { id: pathway.id } });
		}).then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {post} /api/pathways/copy 复制巡检路线
* @apiName pathways-copy
* @apiGroup 巡检路线
* @apiDescription 复制巡检路线
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/copy', async (ctx, next) => {
	const data = ctx.request.body;
	if (!data.uuid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	return Pathways.findOne({ where: { uuid: data.uuid, category: 1 } })
		.then((pathway) => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}
			return pathwayService.copyPathway(pathway);
		}).then((pathway) => {
			ctx.body = ServiceResult.getSuccess({ uuid: pathway.uuid, name: pathway.name, description: pathway.description });
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/pathways?page=&limit=&locationId=&name=&keywords= 巡检路线列表
* @apiName pathways-lists
* @apiGroup 巡检路线
* @apiDescription 巡检路线列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {Number} [name] 巡检路线名称
* @apiParam {Number} [keywords] 关键字查询
* @apiParam {Number} [page] 页码，默认1
* @apiParam {Number} [limit] 每页数据条数，默认10
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检路线
* @apiSuccess {Number} data.count 巡检路线数目
* @apiSuccess {Object[]} data.rows 巡检路线信息
* @apiSuccess {String} data.rows.uuid 巡检路线标识的uuid
* @apiSuccess {String} data.rows.name 巡检路线名称
* @apiSuccess {String} data.rows.description 巡检路线说明
* @apiSuccess {Boolean} data.rows.inuse 是否启用 true-启用 false-弃用
* @apiSuccess {Number} data.rows.companyId 客戶id
* @apiSuccess {Object} data.rows.company 客戶信息，详情查看客户信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/', async (ctx, next) => {
	let { locationId, page, limit, name, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { category: 1 };
	if (name) where.name = { [Op.iLike]: `%${name}%` };
	if (keywords) {
		where[Op.or] = [
			{ name: { [Op.iLike]: `%${keywords}%` } },
			{ description: { [Op.iLike]: `%${keywords}%` } }
		];
	}

	return Locations.findOne({ where: { id: locationId || null } })
		.then(location => {
			if (!locationId || !location) {
				return Promise.reject('参数错误');
			}
			where.locationUuid = location.uuid;
			return Pathways.findAndCountAll({
				where,
				limit,
				offset,
				include: [ { model: Companies, as: 'company' } ],
				order: [ [ 'createdAt', 'DESC' ] ]
			});
		}).then(res => {
			ctx.body = ServiceResult.getSuccess(res);
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/pathways/personnels?role= 当前用户巡检路线列表
* @apiName pathways-personnels
* @apiGroup 巡检路线
* @apiDescription 查询当前用户相关的巡检路线列表
* @apiHeader {String} authorization 登录token Bearer + token
* @@apiParam  {Number} [role] 角色  1-执行者operator 2-sv 3-manager， 默认1
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 巡检路线
* @apiSuccess {String} data.uuid 巡检路线标识的uuid
* @apiSuccess {String} data.name 巡检路线名称
* @apiSuccess {String} data.description 巡检路线说明
* @apiSuccess {Boolean} data.inuse 是否启用 true-启用 false-弃用
* @apiSuccess {Number} data.companyId 客戶id
* @apiSuccess {Object} data.company 客戶信息，详情查看客户信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let role = Number(ctx.query.role) || 1;
	try {
		let personnels = await Personnels.findAll({ where: { userId: user.userId, role, category: 1 } });
		let pathwayLists = [];
		for (let personnel of personnels) {
			let location = await Locations.findOne({ where: { uuid: personnel.locationUuid, category: 2 } });
			if (!location) continue;

			let pathways = await Pathways.findAll({
				where: { locationUuid: personnel.locationUuid, category: 1, inuse: true },
				include: [ { model: Companies, as: 'company' } ]
			});
			pathwayLists = pathwayLists.concat(pathways);
		}
		ctx.body = ServiceResult.getSuccess(pathwayLists);
		next();
	} catch (error) {
		ctx.body = ServiceResult.getFail('获取失败');
		next();
	}
});

/**
* @api {get} /api/pathways/:uuid 巡检路线详情
* @apiName pathways-info
* @apiGroup 巡检路线
* @apiDescription 巡检路线详情
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检路线
* @apiSuccess {String} data.uuid 巡检路线标识的uuid
* @apiSuccess {String} data.name 巡检路线名称
* @apiSuccess {String} data.description 巡检路线说明
* @apiSuccess {Boolean} data.inuse 是否启用 true-启用 false-弃用
* @apiSuccess {Number} data.companyId 客戶id
* @apiSuccess {Object} data.company 客戶信息，详情查看客户信息
* @apiSuccess {Object[]} data.pathequipments 巡检设备列表
* @apiSuccess {Number} data.equipmentId 巡检设备id
* @apiSuccess {Object} data.equipment 巡检设备信息，详情查看设备录入
* @apiSuccess {Object[]} data.pathequipments.pathinspections 设备检查项列表
* @apiSuccess {Number} data.pathinspections.inspectionId 设备检查项id
* @apiSuccess {Object} data.pathinspections.inspection 检查项详细信息，详情查看检查项
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:uuid', async (ctx, next) => {
	return Pathways.findOne({
		where: { uuid: ctx.params.uuid, category: 1 },
		include: [
			{ model: Companies, as: 'company', attributes: [ 'id', 'name', 'costcenter' ] },
			{
				model: PathEquipments,
				as: 'pathequipments',
				where: { category: 1 },
				include: [
					{ model: Equipments, as: 'equipment' },
					{
						model: PathInspections,
						as: 'pathinspections',
						where: { category: 1 },
						include: [ { model: Inspections, as: 'inspection' } ]
					}
				]
			}
		]
	}).then(pathway => {
		ctx.body = ServiceResult.getSuccess(pathway);
		next();
	}).catch(error => {
		console.error(error);
		ctx.body = ServiceResult.getFail('获取巡检路线详情失败');
		next();
	});
});

/**
* @api {get} /api/pathways/:uuid/locations 巡检路线项目点信息
* @apiName pathways-locations
* @apiGroup 巡检路线
* @apiDescription 巡检路线项目点信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点Location
* @apiSuccess {String} data.id 项目点id标识
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
* @apiSuccess {Object[]} data.buildings  项目点楼房列表
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:uuid/locations', async (ctx, next) => {
	let { uuid } = ctx.params.uuid;

	return Pathways.findOne({ where: { uuid, category: 1 } })
		.then(pathway => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}

			return Locations.findOne({
				where: { locationUuid: pathway.locationUuid, category: 2 },
				include: [ { model: Buildings, as: 'buildings' } ]
			}).then(location => {
				if (!location) {
					return Promise.reject('无法获取');
				}
				return location;
			});
		}).then(location => {
			ctx.body = ServiceResult.getSuccess(location);
			next();
		}).catch(error => {
			console.error(error);
			ctx.body = ServiceResult.getFail('获取巡检路线详情失败');
			next();
		});
});

router.post('/:uuid/scan', async (ctx, next) => {
	const uuid = ctx.params.uuid;
	const { barcodeEntry } = ctx.request.body;

	return Pathways.findOne({ where: { uuid, catetory: 1 } })
		.then(pathway => {
			if (!pathway) {
				return Promise.reject('参数错误');
			}
			return Equipments.findOne({ where: { locationUuid: pathway.locationUuid, barcodeEntry, category: 2 } }).then(equipment => {
				if (!equipment) {
					return Promise.reject('无法获取');
				}
				return PathEquipments.findOne({
					where: {
						pathwayId: pathway.id,
						equipmentId: equipment.id,
						category: 1
					}
				}).then(pathEquipment => {
					return PathInspections.findAll({
						where: {
							pathequipmentId: pathEquipment.id,
							category: 1
						},
						raw: true,
						include: [ { model: Inspections, as: 'inspection' } ]
					}).then(pathInspections => {
						let res = { equipment, inspections: [] };
						for (let item of pathInspections) {
							res.inspections.push(item.inspection);
						}
						ctx.body = ServiceResult.getSuccess(res);
					});

					// todo
					next();
				});
			});
		});
});
module.exports = router;
