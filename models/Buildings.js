const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Locations = require('./Locations');
// const Reviews = require('./Reviews');
const Constants = require('./Constants');

// 建筑信息
class Buildings extends Model {}

Buildings.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: '项目点uuid'
	},
	name: {
		type: DataTypes.STRING,
		comment: '建筑名称'
	}, // 建筑名称
	activeStartDate: {
		type: DataTypes.DATEONLY,
		comment: '开始时间'
	},
	buildingClassId: {
		type: DataTypes.INTEGER,
		comment: '建筑类别Id,参考常量表constants'
	},
	address: {
		type: DataTypes.STRING,
		comment: '地址信息'
	}, // 地址
	commonName: {
		type: DataTypes.STRING,
		comment: '通用名称'
	},
	costcenter: {
		type: DataTypes.STRING,
		comment: '成本中心'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	legalName: {
		type: DataTypes.STRING,
		comment: '法律名称'
	},
	mainfax: {
		type: DataTypes.STRING,
		comment: '传真'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	parkingOpen: {
		type: DataTypes.INTEGER,
		comment: '停车位数量'
	},
	primaryUseId: {
		type: DataTypes.INTEGER,
		comment: '主要用途Id,参考常量表constants'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据'
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
Buildings.belongsTo(Constants, { as: 'primaryUse' });

Buildings.sync();

module.exports = Buildings;
