const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');

const Buildings = require('./Buildings');
const Locations = require('./Locations');
// const Reviews = require('./Reviews');
const Constants = require('./Constants');

// 楼层信息
class Floors extends Model {}
Floors.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: '项目点uuid'
	},
	buildingUuid: {
		type: DataTypes.UUID,
		comment: 'Building uuid'
	},
	name: {
		type: DataTypes.STRING,
		comment: '楼层名称'
	}, // 建筑楼层
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	floorClassId: {
		type: DataTypes.INTEGER,
		comment: '楼层类别Id,参考常量表constants'
	},
	floorMaintained: {
		type: DataTypes.BOOLEAN,
		comment: '是否维护',
		defaultValue: false
	},
	grossarea: {
		type: DataTypes.FLOAT,
		comment: '总面积'
	},
	grossexternarea: {
		type: DataTypes.FLOAT,
		comment: '外部面积'
	},
	grossinternalarea: {
		type: DataTypes.FLOAT,
		comment: '内部面积'
	},
	level: {
		type: DataTypes.INTEGER,
		comment: '楼层'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'floors',
	paranoid: true,
	comment: '楼层信息'
});

Locations.hasMany(Floors);
Floors.belongsTo(Locations);

Buildings.hasMany(Floors);
Floors.belongsTo(Buildings);

Floors.belongsTo(Constants, { as: 'floorClass' });

Floors.sync();

module.exports = Floors;
