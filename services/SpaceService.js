const Spaces = require('../models/Spaces');
const Floors = require('../models/Floors');
const util = require('../core/util');
const constUtil = require('../core/util/constants');
class SpaceService {
	/**
	 * 保存空间信息列表
	 * @param {Object} filedatas 空间信息
	 * @param {Ojbect} user 当前操作人员信息
	 */
	static async saveSpaces (filedatas, user) {
		if (!Array.isArray(filedatas)) {
			return Promise.reject('参数错误');
		}

		try {
			let promiseArray = [];

			for (let filedata of filedatas) {
				let data = {
					floorId: filedata['楼层ID'],
					name: filedata['空间名称'] || '',
					area: filedata['面积'] || 0,
					height: filedata['高度'] || '',
					description: filedata['描述'] || '',
					isMaintained: filedata['是否需要维护'] === '是',
					isInner: filedata['是否是室内空间'] === '是',
					wareNum: filedata['器具数量']
				};
				let promise = this.saveSpace(data, user);

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
   * 保存空间信息
   * @param {Ojbect} data 空间信息
   * @param {Ojbect} user 操作人员信息
   */
	static saveSpace (data, user) {
		const spaceData = {
			floorId: data.floorId,
			name: data.name,
			status: Number(data.status) || 0,
			createdUserId: user.userId,
			createdUserName: user.userName,
			pinyin: util.getPinyin(data.name),
			isMaintained: data.isMaintained || false,
			isInner: data.isInner || false
		};

		if (!data.floorId || !data.name) return Promise.reject('参数不正确');

		// 复制基本信息
		util.setProperty([ 'area', 'height', 'description', 'wareNum' ], data, spaceData);

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

		return Floors.findOne({ where: { id: data.floorId } })
			.then(floor => {
				if (!floor) {
					return Promise.reject(`无法获取名称为 ${data.name}的空间`);
				}

				spaceData.companyId = floor.companyId;
				spaceData.locationId = floor.locationId;
				spaceData.buildingId = floor.buildingId;
				spaceData.floorName = floor.name;
				// 创建空间信息
				return Spaces.create(spaceData);
			});
	}
}

module.exports = SpaceService;
