const Companies = require('../models/Companies');
const Locations = require('../models/Locations');
const util = require('../core/util');

class LocationService {
	/**
   * 保存项目点信息列表
   * @param {Object[]} filedatas Excel文件解析后的数据
   * @param {Object} user 操作当前保存的用户信息
   */
	static async saveLocations (filedatas, user, companyId) {
		if (!Array.isArray(filedatas)) {
			return Promise.reject('参数错误');
		}

		try {
			let promiseArray = [];

			for (let filedata of filedatas) {
				let data = {
					companyId: filedata['客户代码'],
					name: filedata['项目点名称'] || '',
					costcenter: filedata['项目编号'] || '',
					provinceCode: util.getProvinceCode(filedata['省名称'] || ''),
					provinceName: filedata['省名称'] || '',
					cityCode: filedata['城市编码'] || '',
					cityName: filedata['城市名称'] || '',
					districtCode: filedata['区县编码'] || '',
					districtName: filedata['区县名称'] || '',
					street: filedata['地址详细'] || '',
					description: filedata['描述'] || '',
					area: filedata['总面积'],
					unit: filedata['测量单位'],
					mainphone: filedata['电话总机'],
					parkingOpen: filedata['停车位数量'],
					zippostal: filedata['邮编']
				};
				let promise = this.saveLocation(data, user);
				promiseArray.push(promise);
			}
			return Promise.all(promiseArray);
		} catch (error) {
			console.log({ error });
			return Promise.reject(error);
		}
	}

	/**
   * 保存项目点信息
   * @param {Ojbect} data 项目点信息
   * @param {Ojbect} user 操作人员信息
   */
	static saveLocation (data, user) {
		const locationData = {
			companyId: data.companyId,
			name: data.name,
			status: Number(data.status) || 0,
			createdUserId: user.userId,
			createdUserName: user.userName,
			pinyin: util.getPinyin(data.name)
		};

		if (!data.companyId || !data.name) return Promise.reject('参数不正确');

		// 复制基本信息
		util.setProperty([ 'costcenter', 'street', 'mainphone', 'propertyClassId',
			'area',	'unit',	'zippostal', 'description', 'parkingOpen' ], data, locationData);

		// 处理省市区信息
		util.setZone(data, locationData);

		return Companies.findOne({ where: { id: data.companyId } })
			.then(company => {
				if (!company) {
					return Promise.reject(`无法获取名称为 ${data.name}的客户`);
				}

				locationData.companyName = company.name;
				// 创建项目点信息
				return Locations.create(locationData);
			});
	}
}

module.exports = LocationService;
