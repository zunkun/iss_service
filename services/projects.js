const Projects = require('../models/Projects');
const Reviews = require('../models/Reviews');
const Buildings = require('../models/Buildings');
const Floors = require('../models/Floors');
const Spaces = require('../models/Spaces');
const Facilities = require('../models/Facilities');
const FIs = require('../models/FIs');

const _ = require('lodash');

class Project {
	constructor () {
		this.projectId = '';
		this.reviewId = '';
	}

	async commit (projectId) {
		this.projectId = projectId;
		this.reviewId = '';
		let project = await Projects.findOne({ where: { id: projectId }, raw: true });

		// 创建审核信息
		let review = await Reviews.create({
			uuid: project.uuid,
			code: project.code,
			name: project.name,
			customerId: project.customerId,
			customerName: project.customerName,
			provinceCode: project.provinceCode,
			cityCode: project.cityCode,
			cityName: project.cityName,
			districtCode: project.districtCode,
			districtName: project.districtName,
			street: project.street,
			svs: project.svs,
			tosv: project.tosv,
			toTime: project.toTime,
			status: 0,
			projecthistoryId: project.id,
			createdAt: project.createdAt,
			updatedAt: project.updatedAt
		});

		this.reviewId = review.id;

		await this.copy();
	}

	/**
   * 复制基本信息，该方法嵌套太多，优化后考虑仍然使用嵌套
   */
	async copy () {
		// 复制待审核的项目详细信息
		let buildingSVs = await Buildings.findAll({ where: { projectId: this.projectId, oesv: 'sv' }, raw: true });

		for (let buildingSV of buildingSVs) {
		// 复制building信息
			let _buildingSV = _.cloneDeep(buildingSV);
			delete _buildingSV.id;
			_buildingSV.reviewId = this.reviewId;
			_buildingSV.oesv = 'oe';
			let buildingOE = await Buildings.create(_buildingSV);

			// 复制floor信息
			let floorSVs = await Floors.findAll({ where: { buildingId: buildingSV.id, oesv: 'sv' }, raw: true });
			for (let floorSV of floorSVs) {
				let _floorSV = _.cloneDeep(floorSV);
				delete _floorSV.id;

				_floorSV.reviewId = this.reviewId;
				_floorSV.buildingId = buildingOE.id;
				_floorSV.oesv = 'oe';
				let floorOE = await Floors.create(_floorSV);

				// 复制space信息
				let spaceSVs = await Spaces.findAll({ where: { floorId: floorSV.id, oesv: 'sv' }, raw: true });

				for (let spaceSV of spaceSVs) {
					let _spaceSV = _.cloneDeep(spaceSV);
					delete _spaceSV.id;

					_spaceSV.reviewId = this.reviewId;
					_spaceSV.buildingId = buildingOE.id;
					_spaceSV.floorId = floorOE.id;
					_spaceSV.oesv = 'oe';
					let spaceOE = await Spaces.create(_spaceSV);

					// 复制设备信息
					let facilitySVs = await Facilities.findAll({ where: { spaceId: spaceSV.id, oesv: 'sv' }, raw: true });

					for (let facilitySV of facilitySVs) {
						let _facilitySV = _.cloneDeep(facilitySV);
						delete _facilitySV.id;

						_facilitySV.reviewId = this.reviewId;
						_facilitySV.buildingId = buildingOE.id;
						_facilitySV.floorId = floorOE.id;
						_facilitySV.spaceId = spaceOE.id;
						_facilitySV.oesv = 'oe';
						let facilityOE = await Facilities.create(_facilitySV);

						// 复制设备检查项
						let fisSVs = await FIs.findAll({ where: { facilityId: facilitySV.id, oesv: 'sv' }, raw: true });

						for (let fisSV of fisSVs) {
							delete fisSV.id;
							fisSV.facilityId = facilityOE.id;
							fisSV.oesv = 'oe';
							await FIs.create(fisSV);
						}
					}
				}
			}
		}
	}
}

const project = new Project();
module.exports = project;
