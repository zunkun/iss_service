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
			pathequipmentId: pathEquipment ? pathEquipment.id : null
		});

		for (let item of inspections) {
			let inspection = await Inspections.findOne({ where: { id: item.id } });
			if (!item) {
				continue;
			}
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
				normal: inspection.datatype === 1 ? (item.state === inspection.normal) : (item.value >= inspection.low && item.value <= inspection.high)
			};
			if (pathEquipment) {
				let pathinspection = await PathInspections.findOne({ where: { pathwayUuid, pathequipmentId: pathEquipment.id, inspectionId: item.id } });

				if (pathinspection) {
					data.pathinspectionId = pathinspection.id;
				}
			}

			await OperateInspections.create(data);
		}
		ctx.body = ServiceResult.getSuccess({});
	} catch (error) {
		console.error(error);
		ctx.body = ServiceResult.getFail(error);
		next();
	}
});
module.exports = router;
