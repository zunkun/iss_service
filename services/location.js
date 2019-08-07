const Companies = require('../models/Companies');
const Locations = require('../models/Locations');
const areaMap = require('../config/areaMap');
const util = require('../core/util');

class LocationService {
	static async saveLocations (filedata, user) {

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
			'unit',	'zippostal', 'description', 'parkingOpen' ], data, locationData);

		// 处理省市区信息
		if (data.provinceCode) {
			locationData.provinceCode = data.provinceCode;
			locationData.provinceName = areaMap.province[data.provinceCode];
		}
		if (data.provinceCode) {
			locationData.cityCode = data.cityCode;
			locationData.cityName = areaMap.city[data.cityCode];
		}
		if (data.districtCode) {
			locationData.districtCode = data.districtCode;
			locationData.districtName = areaMap.district[data.districtCode];
		}

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
