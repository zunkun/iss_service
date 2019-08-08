const Locations = require('../models/Locations');
const Buildings = require('../models/Buildings');
const util = require('../core/util');

class BuildingService {
	/**
	 * 保存建筑信息列表
	 * @param {Object} filedatas 建筑信息
	 * @param {Ojbect} user 当前操作人员信息
	 */
	static async saveBuildings (filedatas, user) {
		if (!Array.isArray(filedatas)) {
			return Promise.reject('参数错误');
		}

		try {
			let promiseArray = [];

			for (let filedata of filedatas) {
				let data = {
					locationId: filedata['客户ID'],
					name: filedata['建筑名称'] || '',
					mainphone: filedata['电话总机'],
					description: filedata['描述'] || ''
				};
				let promise = this.saveBuilding(data, user);

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
   * 保存建筑信息
   * @param {Ojbect} data 建筑信息
   * @param {Ojbect} user 操作人员信息
   */
	static saveBuilding (data, user) {
		const buildingData = {
			locationId: data.locationId,
			name: data.name,
			status: Number(data.status) || 0,
			createdUserId: user.userId,
			createdUserName: user.userName,
			pinyin: util.getPinyin(data.name)
		};

		if (!data.locationId || !data.name) return Promise.reject('参数不正确');

		// 复制基本信息
		util.setProperty([ 'buildingClassId', 'description', 'mainphone' ], data, buildingData);

		return Locations.findOne({ where: { id: data.locationId } })
			.then(location => {
				if (!location) {
					return Promise.reject(`无法获取名称为 ${data.name}的项目点`);
				}

				buildingData.locationName = location.name;
				buildingData.companyId = location.companyId;
				// 创建建筑信息
				return Buildings.create(buildingData);
			});
	}
}

module.exports = BuildingService;
