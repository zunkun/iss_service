const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Locations = require('./Locations');
const Constants = require('./Constants');

// 建筑信息
class Buildings extends Model {}

Buildings.init({
	name: {
		type: DataTypes.STRING,
		comment: '建筑名称'
	}, // 建筑名称
	pinyin: { type: DataTypes.STRING, comment: 'pinyin' },
	buildingClassId: {
		type: DataTypes.INTEGER,
		comment: '建筑类别Id,参考常量表constants'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	createdUserId: {
		type: DataTypes.STRING,
		comment: '创建人钉钉userId'
	},
	createdUserName: {
		type: DataTypes.STRING,
		comment: '创建人姓名'
	},
	companyId: {
		type: DataTypes.STRING,
		comment: '客户ID'
	},
	companyName: {
		type: DataTypes.STRING,
		comment: '客户名称'
	},
	locationName: {
		type: DataTypes.STRING,
		comment: '项目点名称'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-启用 2-弃用'
	}
}, {
	sequelize: postgres,
	modelName: 'buildings',
	comment: '建筑信息',
	paranoid: true
});

Locations.hasMany(Buildings);
Buildings.belongsTo(Locations);

Buildings.belongsTo(Constants, { as: 'buildingClass' });

Buildings.sync();

module.exports = Buildings;
