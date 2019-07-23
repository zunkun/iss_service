const Reviews = require('../models/Reviews');
const Locations = require('../models/Locations');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const Equipments = require('../models/Equipments');
const Personnels = require('../models/Personnels');
const _ = require('lodash');
const moment = require('moment');

class ReviewService {
	constructor () {
		this.location = {};
		this.locationId = '';
	}

	async commit (locationId) {
		let that = this;
		this.locationId = locationId;
		return Locations.findOne({
			where: { id: locationId },
			raw: true
		}).then(async location => {
			that.location = location;
			if (!location) return Promise.reject('参数错误');

			let reviewData = {
				locationName: location.name,
				locationUuid: location.uuid,
				companyId: location.companyId,
				svs: [],
				managers: [],
				status: 0
			};

			return Reviews.findOne({ where: { locationId, status: 0 } })
				.then(async review => {
					if (review) {
						// TODO: 个人认为此处应该允许提交，是提交到最新版本，后续开发
						return Promise.reject('提交失败，系统中存在正在审批中的设备提交记录，不允许提交');
					}
					let sPersonnels = await Personnels.findAll({ where: { locationUuid: location.uuid, role: 2 } });
					let mPersonnels = await Personnels.findAll({ where: { locationUuid: location.uuid, role: 3 } });

					for (let sPersonel of sPersonnels) {
						reviewData.svs.push({ userId: sPersonel.userId, userName: sPersonel.userName });
					}

					for (let mPersonnel of mPersonnels) {
						reviewData.svs.push({ userId: mPersonnel.userId, userName: mPersonnel.userName });
					}
					await this.copy(reviewData);
				});
		});
	}

	/**
   * 复制基本信息，该方法嵌套太多，优化后考虑仍然使用嵌套
   */
	async copy (reviewData) {
		let locationData = _.clone(this.location);
		delete locationData.id;
		locationData.category = 1;
		let locationReview = await Locations.create(locationData);

		reviewData.locationId = locationReview.id;
		let review = await Reviews.create(reviewData);
		this.reviewId = review.id;

		// 复制待审核的项目详细信息
		let buildings = await Buildings.findAll({ where: { locationId: this.locationId, category: 0 }, raw: true });

		try {
			for (let building of buildings) {
				// 复制building信息
				let _building = _.cloneDeep(building);
				delete _building.id;
				_building.locationId = locationReview.id;
				_building.category = 1;
				let buildingReview = await Buildings.create(_building);

				// 复制floor信息
				let floors = await Floors.findAll({ where: { buildingId: building.id, category: 0 }, raw: true });
				for (let floor of floors) {
					let _floor = _.cloneDeep(floor);
					delete _floor.id;

					_floor.locationId = locationReview.id;
					_floor.buildingId = buildingReview.id;
					_floor.category = 1;
					let floorReview = await Floors.create(_floor);

					// 复制space信息
					let spaces = await Spaces.findAll({ where: { floorId: floor.id, category: 0 }, raw: true });

					for (let space of spaces) {
						let _space = _.cloneDeep(space);
						delete _space.id;

						_space.locationId = locationReview.id;
						_space.buildingId = buildingReview.id;
						_space.floorId = floorReview.id;
						_space.category = 1;
						let spaceReview = await Spaces.create(_space);

						// 复制设备信息
						let equipments = await Equipments.findAll({ where: { spaceId: space.id, category: 0 }, raw: true });

						for (let equipment of equipments) {
							let _equipment = _.cloneDeep(equipment);
							delete _equipment.id;

							_equipment.locationId = locationReview.id;
							_equipment.buildingId = buildingReview.id;
							_equipment.floorId = floorReview.id;
							_equipment.spaceId = spaceReview.id;
							_equipment.category = 1;
							await Equipments.create(_equipment);
						}
					}
				}
			}
			return Promise.resolve();
		} catch (error) {
			console.error(error);
			return Promise.reject(error);
		}
	}

	async agree (locationId, locationUuid) {
		let _locations = await Locations.findAll({ where: { uuid: locationUuid, category: 2 }, raw: true });

		try {
			for (let _location of _locations) {
				await this.setCategory(_location.id, 2, 3);
			}

			await this.setCategory(locationId, 1, 2);
			await Equipments.update({ activeStartDate: moment().format('YYYY-MM-DD'), category: 2 }, { where: { locationId, category: 1, activeStartDate: null } });
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async setCategory (locationId, preCategory, category) {
		try {
			await Locations.update({ category }, { where: { id: locationId, category: preCategory } });
			await Buildings.update({ category }, { where: { locationId, category: preCategory } });
			await Floors.update({ category }, { where: { locationId, category: preCategory } });
			await Spaces.update({ category }, { where: { locationId, category: preCategory } });
			await Equipments.update({ category }, { where: { locationId, category: preCategory } });
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

const reviewService = new ReviewService();
module.exports = reviewService;
