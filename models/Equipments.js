const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Constants = require('./Constants');
const Locations = require('./Locations');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Spaces = require('./Spaces');
const Specs = require('./Specs');

class Equipments extends Model {}

// 设备信息
Equipments.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		comment: '设备名称'
	},
	activeStartDate: {
		type: DataTypes.DATEONLY,
		comment: '生效日期'
	},
	barcodeEntry: {
		type: DataTypes.STRING,
		comment: '编号'
	},
	conditionId: {
		type: DataTypes.INTEGER,
		comment: '状况Id'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	grpassetcriticalityId: {
		type: DataTypes.INTEGER,
		comment: '重要程度,参考常量表constants'
	},
	nameplate: {
		type: DataTypes.STRING,
		comment: '名牌'
	},
	parentAssetId: {
		type: DataTypes.INTEGER,
		comment: '父设备Id'
	},
	power: {
		type: DataTypes.STRING,
		comment: '功率'
	},

	quantity: {
		type: DataTypes.INTEGER,
		comment: '数量'
	},
	remarks: {
		type: DataTypes.TEXT,
		comment: '备注'
	},
	serialNum: {
		type: DataTypes.STRING,
		comment: '序列号'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据'
	},
	inspect: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
}, {
	sequelize: postgres,
	modelName: 'equipments',
	paranoid: true,
	comment: '设备信息'
});

Locations.hasMany(Equipments);
Equipments.belongsTo(Locations);

// Equipments.belongsTo(Reviews);
// Reviews.hasMany(Equipments);

Buildings.hasMany(Equipments);
Equipments.belongsTo(Buildings);

Floors.hasMany(Equipments);
Equipments.belongsTo(Floors);

Spaces.hasMany(Equipments);
Equipments.belongsTo(Spaces);

Equipments.belongsTo(Specs);
Specs.hasMany(Equipments);

Equipments.belongsTo(Equipments, { as: 'parentAsset' });

Equipments.belongsTo(Constants, { as: 'condition' });
Equipments.belongsTo(Constants, { as: 'grpassetcriticality' });

Equipments.sync();

module.exports = Equipments;
