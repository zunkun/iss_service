const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Companies = require('./Companies');
const Locations = require('./Locations');

class Pathways extends Model {}
// 巡检路线信息
Pathways.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: 'Location的uuid该标识标书属于哪个巡检路线'
	},
	pathcode: {
		type: DataTypes.STRING,
		comment: '巡检路线方案流水code'
	},
	name: {
		type: DataTypes.STRING,
		comment: '巡检路线名称'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '巡检路线描述'
	},
	inuse: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		comment: '是否启用'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-使用的数据 2-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'pathways',
	paranoid: true,
	comment: '巡检路线信息'
});

Companies.hasMany(Pathways);
Pathways.belongsTo(Companies);

Locations.hasMany(Pathways);
Pathways.belongsTo(Locations);

Pathways.sync();

module.exports = Pathways;
