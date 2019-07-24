const ServiceResult = require('../core/ServiceResult');
const Pathways = require('../models/Pathways');
const moment = require('moment');
const OperatePaths = require('../models/OperatePaths');
const Personnels = require('../models/Personnels');
const jwt = require('jsonwebtoken');
const Equipments = require('../models/Equipments');
const OperateEquipments = require('../models/OperateEquipments');
const Inspections = require('../models/Inspections');
const PathEquipments = require('../models/PathEquipments');
const operation = require('../services/operation');
const OperateInspections = require('../models/OperateInspections');
const PathInspections = require('../models/PathInspections');
const Locations = require('../models/Locations');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');

const { Op } = require('sequelize');

const Router = require('koa-router');
const router = new Router();
router.prefix('/api/operations');

/**
* @api {post} /api/operations 创建巡检员巡检记录
* @apiName operations-create
* @apiGroup 巡检员巡检记录
* @apiDescription 创建巡检员巡检记录,如果当日有尚未完成巡检记录，则继续上一次巡检
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检员巡检记录信息
* @apiSuccess {String} data.id 巡检Id
* @apiSuccess {String} data.pathwayUuid 巡检路线uuid
* @apiSuccess {String} data.pathwayName 巡检路线名称
* @apiSuccess {String} data.date 巡检日期
* @apiSuccess {Date} data.startTime 巡检开始时间
* @apiSuccess {Boolean} data.accomplished 当前巡检路线是否已经巡检所有项
* @apiSuccess {String} data.userId 巡检员userId
* @apiSuccess {String} data.userName 巡检员姓名
* @apiSuccess {Object} data.personnel 巡检员信息
* @apiSuccess {Object} data.pathway 巡检路线信息
* @apiSuccess {Number} data.category 巡检状态 1-巡检中 2-巡检数据已提交
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let date = moment().format('YYYY-MM-DD');
	const { pathwayUuid } = ctx.request.body;
	if (!user || !user.userId || !pathwayUuid) {
		ctx.body = ServiceResult.getFail('参数错误');
		next();
	}

	return Personnels.findOne({ where: { userId: user.userId, role: 1 } })
		.then(personnel => {
			if (!personnel) {
				return Promise.reject('当前用户不是该项目点的巡检员');
			}

			return Pathways.findOne({ where: { uuid: pathwayUuid, category: 1 } })
				.then(pathway => {
					if (!pathway) {
						return Promise.reject('无法获取巡检路线信息');
					}

					return OperatePaths.findOne({
						where: { pathwayUuid, category: 1, date, userId: user.userId }
					}).then(operatepath => {
						if (operatepath) {
							return operatepath;
						}
						console.log(pathway.locationId, pathway.locationUuid);
						return OperatePaths.create({
							locationId: pathway.locationId,
							locationUuid: pathway.locationUuid,
							pathwayUuid,
							pathwayName: pathway.name,
							date,
							startTime: new Date(),
							accomplished: false,
							userId: user.userId,
							userName: user.userName,
							category: 1,
							pathwayId: pathway.id,
							personnelId: personnel.id
						});
					});
				});
		}).then((operatepath) => {
			ctx.body = ServiceResult.getSuccess(operatepath);
			next();
		}).catch(error => {
			console.error('创建巡检记录失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/operations/equipments?limit=&page=&from=&to=&pathwayName=&equipmentName=&operatorName=&normal=&locationId=&buildingId=&floorId=&spaceId= 设备巡检记录表
* @apiName operations-equipments
* @apiGroup 巡检员巡检记录
* @apiDescription 设备巡检记录表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检员巡检记录信息
* @apiSuccess {Object} data.operatepath 巡检主表
* @apiSuccess {Object} data.pathway 巡检路线信息
* @apiSuccess {Object} data.location 巡检项目点信息
* @apiSuccess {Object[]} data.equipments 设备检查信息
* @apiSuccess {Object} data.equipments.equipment 设备信息
* @apiSuccess {Object[]} data.inspect.operateInspections 检查项检查记录
* @apiSuccess {Object} data.inspect.operateInspections.inspect 检查项规则
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/equipments', async (ctx, next) => {
	let { page, limit, from, to, pathwayName, operatorName, normal, locationId, buildignId, floorId, spaceId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	let where = { normal: !!normal };
	let equipmentWhere = {};

	if (from) {
		where.date = {};
		where.date[Op.gte] = from;
	}
	if (to) {
		if (!where.date) {
			where.date = {};
		}
		where.date[Op.lte] = to;
	}

	if (pathwayName) where.pathwayName = { [Op.iLike]: `%${pathwayName}%` };
	if (pathwayName) where.pathwayName = { [Op.iLike]: `%${pathwayName}%` };
	if (operatorName) where.userName = { [Op.iLike]: `%${operatorName}%` };
	if (locationId) {
		let location = await Locations.findOne({ id: locationId || null });
		where.locationUuid = location.uuid;
		equipmentWhere.locationUuid = location.uuid;
	}

	let operatepaths = await OperatePaths.findAll({ where });

	let operatepathMap = new Map();
	let pathIds = [];
	for (let operatepath of operatepaths) {
		pathIds.push(operatepath.id);
		operatepathMap.set(operatepath.id, operatepath);
	}

	equipmentWhere.operatepathId = { [Op.in]: pathIds };

	if (buildignId) {
		let building = await Buildings.findOne({ id: buildignId || null });
		equipmentWhere.buildingUuid = building.uuid;
	}

	if (floorId) {
		let floor = await Floors.findOne({ id: floorId || null });
		equipmentWhere.floorUuid = floor.uuid;
	}

	if (spaceId) {
		let space = await Spaces.findOne({ id: spaceId || null });
		equipmentWhere.spaceUuid = space.uuid;
	}

	let operateEquipments = await OperateEquipments.findAndCountAll({
		where: equipmentWhere,
		limit,
		offset,
		order: [ [ 'createdAt', 'DESC' ] ]
	});

	let equipments = [];
	// 依次获取设备详细信息
	for (let operateEquipment of operateEquipments) {
		// 设备信息
		let equipment = await Equipments.findOne({ uuid: operateEquipment.equipmentUuid, category: 2 });
		// 检查结果
		let operateInspections = await OperateInspections.findAll({
			where: {
				operateequipmentId: operateEquipment.id
			},
			// 检查项信息
			include: [ { model: Inspections, as: 'inspection' } ]
		});
		equipments.push({
			operatepath: operatepathMap.get(operateEquipment.operatepathId),
			equipment,
			operateInspections
		});
	}

	ctx.body = ServiceResult.getSuccess(equipments);
});

/**
* @api {post} /api/operations/inspect 保存设备巡检信息
* @apiName operations-create
* @apiGroup 巡检员巡检记录
* @apiDescription 保存设备巡检信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiParam {Number} equipmentId 设备id
* @apiParam {Object[]} inspections 设备检查项信息
* @apiParam {Number} inspections.id 检查项id
* @apiParam {Number} inspections.[state] 检查项选择的值，分别为1~4, 参考检查项接口，state和value必须填写一个
* @apiParam {Number} inspections.[value] 检查项的值，如果当前检查项检查类型为输入类型, state和value必须填写一个
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/inspect', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let { pathwayUuid, equipmentId, inspections } = ctx.request.body;
	let pathway = await Pathways.findOne({ where: { uuid: pathwayUuid, category: 1 } });
	if (!pathwayUuid || !pathway || !equipmentId || !inspections || !Array.isArray(inspections) || !inspections.length) {
		return Promise.reject('参数错误');
	}

	for (let item of inspections) {
		if (!item.id || (!item.state && (!item.value && item.value !== 0))) {
			return Promise.reject('参数错误');
		}
	}

	try {
		// 获取并保存巡检记录
		let operatepath = await operation.getOperatePath({ pathwayUuid, userId: user.userId });

		let equipment = await Equipments.findOne({ where: { id: equipmentId } });

		if (!equipment) {
			return Promise.reject('参数错误');
		}
		// 获取巡检路线是否有当前设备
		let pathEquipment = await PathEquipments.findOne({ where: { pathwayUuid, equipmentUuid: equipment.uuid } });

		// 保存巡检设备信息
		let operateEquipment = await OperateEquipments.create({
			operatepathId: operatepath.id,
			companyId: pathway.companyId,
			pathwayId: pathway.id,
			pathwayUuid,
			equipmentId,
			equipmentUuid: equipment.uuid,
			equipmentName: equipment.name,
			locationId: pathway.locationId,
			locationUuid: pathway.locationUuid,
			buildingUuid: equipment.buildingUuid,
			floorUuid: equipment.floorUuid,
			spaceUuid: equipment.spaceUuid,
			normal: true,
			pathequipmentId: pathEquipment ? pathEquipment.id : null
		});

		let normal = true;
		let inspectUnormals = new Set();
		let equipUnormals = new Set();
		for (let item of inspections) {
			let inspection = await Inspections.findOne({ where: { id: item.id } });
			if (!item) {
				continue;
			}
			let isNormal = inspection.datatype === 1 ? (item.state === inspection.normal) : (item.value >= inspection.low && item.value <= inspection.high);
			let data = {
				operatepathId: operatepath.id,
				operateequipmentId: operateEquipment.id,
				pathequipmentId: pathEquipment ? pathEquipment.id : null,
				locationUuid: pathway.locationUuid,
				pathwayId: pathway.id,
				pathwayUuid,
				equipmentUuid: equipment.uuid,
				equipmentId: equipment.id,
				inspectionId: item.id,
				state: Number(item.state) || null,
				value: Number(item.value) || null,
				images: item.images || null,
				normal: isNormal
			};
			if (!isNormal) {
				normal = false;
				inspectUnormals.add(inspection.name);
				equipUnormals.add(equipment.name);
			}

			if (pathEquipment) {
				let pathinspection = await PathInspections.findOne({ where: { pathwayUuid, pathequipmentId: pathEquipment.id, inspectionId: item.id } });

				if (pathinspection) {
					data.pathinspectionId = pathinspection.id;
				}
			}

			await OperateInspections.create(data);
		}
		// 检查项不正常，则填写不正常日志
		if (!normal) {
			await OperateEquipments.update({ normal, unnormalInfos: Array.from(inspectUnormals) }, { where: { id: operateEquipment.id } });
			await OperatePaths.update({ normal, unnormalInfos: Array.from(equipUnormals) }, { where: { id: operatepath.id } });
		}
		ctx.body = ServiceResult.getSuccess({});
	} catch (error) {
		console.error(error);
		ctx.body = ServiceResult.getFail(error);
		next();
	}
});

/**
* @api {get} /api/operations/:id 查看某次巡检记录
* @apiName operations-info
* @apiGroup 巡检员巡检记录
* @apiDescription 查看某次巡检记录
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检员巡检记录信息
* @apiSuccess {Object} data.operatepath 巡检主表
* @apiSuccess {Object} data.pathway 巡检路线信息
* @apiSuccess {Object} data.location 巡检项目点信息
* @apiSuccess {Object[]} data.equipments 设备检查信息
* @apiSuccess {Object} data.equipments.equipment 设备信息
* @apiSuccess {Object[]} data.inspect.operateInspections 检查项检查记录
* @apiSuccess {Object} data.inspect.operateInspections.inspect 检查项规则
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	// 本接口查询不采用join方式
	let res = { operatepath: {}, equipments: [] };
	try {
		// 巡检记录主表
		let operatepath = await OperatePaths.findOne({
			where: { id: ctx.param.id },
			attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }
		});

		res.operatepath = operatepath;
		if (!operatepath) {
			ctx.body = ServiceResult.getFail('参数错误');
		}

		// 巡检路线信息
		let pathway = await Pathways.findOne({ uuid: operatepath.pathwayUuid, category: 1 });
		// 巡检项目点信息
		let location = await Locations.findOne({ uuid: operatepath.locationUuid, category: 2 });
		res.pathway = pathway;
		res.location = location;

		// 巡检设备表
		let operateEquipments = await OperateEquipments.findAll({
			where: { operatepathId: operatepath.id	},
			attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }
		});

		let equipments = [];
		// 依次获取设备详细信息
		for (let operateEquipment of operateEquipments) {
			// 设备信息
			let equipment = await Equipments.findOne({ uuid: operateEquipment.equipmentUuid, category: 2 });
			// 检查结果
			let operateInspections = await OperateInspections.findAll({
				where: {
					operateequipmentId: operateEquipment.id
				},
				// 检查项信息
				include: [ { model: Inspections, as: 'inspection' } ]
			});
			equipments.push({ equipment, operateInspections });
		}

		res.equipments = equipments;
		ctx.body = ServiceResult.getSuccess(res);
		next();
	} catch (error) {
		console.error(error);
		ctx.body = ServiceResult.getFail(error);
		next();
	}
});

module.exports = router;
