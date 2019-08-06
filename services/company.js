const Companies = require('../models/Companies');
const areaMap = require('../config/areaMap');
const util = require('../core/util');
class CompanyService {
	/**
   * 保存客户信息列表
   * @param {Object[]} filedatas Excel文件解析后的数据
   * @param {Object} user 操作当前保存的用户信息
   */
	static async saveCompanines (filedatas, user) {
		if (!Array.isArray(filedatas)) {
			return Promise.reject('参数错误');
		}

		try {
			let promiseArray = [];

			for (let filedata of filedatas) {
				let data = {
					name: filedata['客户名称'] || '',
					shortname: filedata['客户名称缩写'] || '',
					costcenter: filedata['财务编号'] || '',
					email: filedata['邮箱'] || '',
					provinceName: filedata['省名称'] || '',
					cityCode: filedata['城市编码'] || '',
					cityName: filedata['城市名称'] || '',
					districtCode: filedata['区县编码'] || '',
					districtName: filedata['区县名称'] || '',
					street: filedata['地址详细'] || '',
					description: filedata['描述'] || ''
				};
				let promise = this.saveCompany(data, user)
					.catch(error => {
						console.log({ error });
 						return Promise.resolve({ });
					});
				promiseArray.push(promise);
			}
			return Promise.all(promiseArray);
		} catch (error) {
			console.log({ error });
			return Promise.reject(error);
		}
	}

	/**
   * 保存客户信息
   * @param {Object} data 客户信息
   * @param {Object} user 操作当前保存的用户信息
   */
	static saveCompany (data, user) {
		const companyData = {
			name: data.name,
			status: Number(data.status) || 0,
			createdUserId: user.userId,
			createdUserName: user.userName
		};
		console.log({ data });
		if (!data.name) {
			return Promise.reject('解析客户信息出错，信息不完整');
		}
		companyData.shortname = data.shortname || data.name;
		companyData.pinyin = {
			name: util.getPinyin(companyData.name),
			shortname: util.getPinyin(companyData.shortname)
		};

		// 复制基本信息
		util.setProperty([ 'costcenter', 'street', 'email',
			'mainphone', 'zippostal', 'description' ], data, companyData);
		// 处理省市区信息
		if (data.provinceCode) {
			companyData.provinceCode = data.provinceCode;
			companyData.provinceName = areaMap.province[data.provinceCode];
		}
		if (data.provinceCode) {
			companyData.cityCode = data.cityCode;
			companyData.cityName = areaMap.city[data.cityCode];
		}
		if (data.districtCode) {
			companyData.districtCode = data.districtCode;
			companyData.districtName = areaMap.district[data.districtCode];
		}
		return Companies.findOne({ where: { name: data.name } })
			.then(company => {
				if (company) {
					return Promise.reject(`系统中已经存在名称为 ${data.name}的客户`);
				}
				return Companies.create(companyData);
			});
	}
}

module.exports = CompanyService;
