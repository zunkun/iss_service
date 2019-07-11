const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
// 组织信息表
class Companies extends Model {}

Companies.init({
	name: {
		type: DataTypes.STRING,
		comment: '客户名称'
	}, // 名称
	costcenter: {
		type: DataTypes.STRING,
		comment: '成本中心'
	},
	address: {
		type: DataTypes.STRING,
		comment: '地址'
	},
	apcompanycode: {
		type: DataTypes.STRING,
		comment: '项目代码'
	},
	email: {
		type: DataTypes.STRING,
		comment: '邮箱'
	},
	mainfax: {
		type: DataTypes.STRING,
		comment: '传真'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	shortname: {
		type: DataTypes.STRING,
		comment: '名称缩写'
	},
	zippostal: {
		type: DataTypes.STRING,
		comment: '邮编'
	},
	industryCode: {
		type: DataTypes.STRING,
		comment: '行业code'
	}, // 行业
	site: {
		type: DataTypes.STRING,
		comment: '网址'
	}, // 网址
	oe: DataTypes.JSONB
}, { sequelize: postgres, modelName: 'company', paranoid: true, comment: '组织信息表' });

Companies.sync();

module.exports = Companies;
