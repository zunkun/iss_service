const Floors = require('../models/Floors');
const Buildings = require('../models/Buildings');
const util = require('../core/util');

class FloorService {
	/**
	 * 保存楼层信息列表
	 * @param {Object} filedatas 楼层信息
	 * @param {Ojbect} user 当前操作人员信息
	 */
	static async saveFloors (filedatas, user) {
		if (!Array.isArray(filedatas)) {
			return Promise.reject('参数错误');
		}

		try {
			let promiseArray = [];

			for (let filedata of filedatas) {
				let data = {
					buildingId: filedata['建筑ID'],
					name: filedata['楼层名称'] || '',
					level: filedata['楼层'] || '',
					description: filedata['描述'] || '',
					isMaintained: filedata['是否需要维护'] === '是',
					area: filedata['总面积'],
					outerarea: filedata['外部面积'],
					innerarea: filedata['内部面积']
				};
				let promise = this.saveFloor(data, user);

				promiseArray.push(promise);
			}
			return Promise.all(promiseArray).catch(error => {
				console.error({ error });
				return Promise.resolve();
			});
		} catch (error) {
			console.error({ error });
			return Promise.reject(error);
		}
	}

	/**
   * 保存楼层信息
   * @param {Ojbect} data 楼层信息
   * @param {Ojbect} user 操作人员信息
   */
	static saveFloor (data, user) {
		const floorData = {
			buildingId: data.buildingId,
			name: data.name,
			status: Number(data.status) || 0,
			createdUserId: user.userId,
			createdUserName: user.userName,
			pinyin: util.getPinyin(data.name),
			isMaintained: data.isMaintained || false
		};

		if (!data.buildingId || !data.name) return Promise.reject('参数不正确');

		// 复制基本信息
		util.setProperty([ 'floorClassId', 'level', 'description', 'area', 'outerarea', 'innerarea' ], data, floorData);

		return Buildings.findOne({ where: { id: data.buildingId } })
			.then(building => {
				if (!building) {
					return Promise.reject(`无法获取名称为 ${data.name}的楼层`);
				}

				floorData.companyId = building.companyId;
				floorData.locationId = building.locationId;
				floorData.buildingName = building.name;
				floorData.companyId = building.companyId;
				// 创建楼层信息
				return Floors.create(floorData);
			});
	}
}

module.exports = FloorService;
