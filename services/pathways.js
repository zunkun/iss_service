const Locations = require('../models/Locations');
const Pathways = require('../models/Pathways');
const PathEquipments = require('../models/PathEquipments');
const PathInspections = require('../models/PathInspections');
const Equipments = require('../models/Equipments');
const util = require('../core/util');
const moment = require('moment');

class PathwayService {
	/**
	 * 设置巡检路线
	 * @param {number} locationId location id
	 * @param {Object} pathwayData pathway data
	 * @param {Ojbect[]} equipments 巡检路线设备表
	 * @return {Object} pathway 巡检路线数据
	 */
	async setPathways (locationId, pathwayData, equipments) {
		let pathwayId;
		let sysPathway;
		let location;
		return Locations.findOne({ where: { id: locationId } })
			.then(locationDta => {
				if (!locationDta) {
					return Promise.reject('参数不正确');
				}
				location = locationDta;
				pathwayData.locationUuid = locationDta.uuid;
				pathwayData.companyId = locationDta.companyId;

				// 保存巡检路线
				return Pathways.create(pathwayData);
			}).then((pathway) => {
				sysPathway = pathway;
				pathwayId = pathway.id;
				let promiseArray = [];
				for (let equipment of equipments) {
					let promise = Equipments.findOne({ where: { id: equipment.id } })
						.then(async equipmentData => {
							if (!equipmentData) {
								return Promise.reject('参数错误');
							}
							let equipmentInspectionIds = equipment.inspections || [];
							// 获取设备中检查项列表，并对比，传参是否在检查项列表中
							return util.getEI(equipment.id).then((ids) => {
								for (let id of equipmentInspectionIds) {
									if (ids.indexOf(id) === -1) {
										return Promise.reject('参数错误');
									}
								}

								// 保存巡检设备
								return PathEquipments.create({
									companyId: location.companyId,
									pathwayId,
									equipmentId: equipment.id,
									category: 1
								}).then(async pathEquipment => {
								// 保存检查项列表
									let promiseArray2 = [];
									for (let id of equipmentInspectionIds) {
										let promise2 = PathInspections.create({
											pathwayId,
											pathequipmentId: pathEquipment.id,
											inspectionId: id,
											category: 1
										});
										promiseArray2.push(promise2);
									}
									return Promise.all(promiseArray2);
								});
							});
						});
					promiseArray.push(promise);
				}
				return Promise.all(promiseArray);
			}).then(() => {
				return sysPathway;
			})
			.catch(async error => {
				console.log(error);
				// 删除错误数据
				if (pathwayId) {
					await PathInspections.destroy({ where: { pathwayId } });
					await PathEquipments.destroy({ where: { pathwayId } });
					await Pathways.destroy({ where: { id: pathwayId } });
				}
				return Promise.reject(error);
			});
	}

	/**
	 * 更新巡检路线
	 * @param {String} uuid pathway uuid
	 * @param {Ojbect} pathwayData pathway data
	 * @param {Object[]} equipments 巡检路线设备表
	 * @return {Object} pathway 新的巡检路线数据
	 */
	async updatePathway (uuid, pathwayData, equipments) {
		let that = this;
		pathwayData.uuid = uuid;
		pathwayData.category = 1;
		let locationUuid;
		return Pathways.findAll({ where: { uuid, category: 1 } }).then(async pathways => {
			locationUuid = pathways[0].locationUuid;
			for (let pathway of pathways) {
				await PathInspections.update({ category: 2 }, { where: { pathwayId: pathway.id } });
				await PathEquipments.update({ category: 2 }, { where: { pathwayId: pathway.id } });
				await Pathways.update({ category: 2 }, { where: { id: pathway.id } });
			}
			return Promise.resolve();
		}).then(() => {
			return Locations.findOne({ where: { uuid: locationUuid } })
				.then((location) => {
					return that.setPathways(location.id, pathwayData, equipments);
				});
		}).catch(error => {
			return Promise.reject(error);
		});
	}

	/**
	 * 复制巡检路线
	 * @param {Ojbect} pathwayData pathway 对象
	 * @return {Object} pathway 新的巡检路线数据
	 */
	async copyPathway (pathwayData) {
		let pathwayNew = {
			companyId: pathwayData.companyId,
			name: pathwayData.name,
			description: pathwayData.description,
			inuse: pathwayData.inuse,
			pathcode: moment().format('YYYYMMDDHHMMssSSS'),
			locationUuid: pathwayData.locationUuid,
			category: pathwayData.category
		};

		return Pathways.create(pathwayNew)
			.then(pathway => {
				return PathEquipments.findAll({ where: { pathwayId: pathwayData.id }, raw: true }).then(pathEquipments => {
					let promiseArray = [];
					for (let pathEquipment of pathEquipments) {
						let promise = PathEquipments.create({
							companyId: pathEquipment.companyId,
							pathwayId: pathway.id,
							equipmentId: pathEquipment.equipmentId,
							category: pathEquipment.category
						}).then((pathEquipmentNew) => {
							return PathInspections.findAll({ where: { pathequipmentId: pathEquipment.id } }).then(pathInspections => {
								let promiseArray2 = [];
								for (let item of pathInspections) {
									let promise2 = PathInspections.create({
										pathequipmentId: pathEquipmentNew.id,
										pathwayId: pathway.id,
										inspectionId: item.inspectionId,
										category: item.category
									});
									promiseArray2.push(promise2);
								}
								return Promise.all(promiseArray2);
							});
						});
						promiseArray.push(promise);
					}
					return Promise.all(promiseArray).then(() => {
						return pathway;
					});
				});
			}).catch(error => {
				return Promise.reject(error);
			});
	}
}

const pathwayService = new PathwayService();
module.exports = pathwayService;
