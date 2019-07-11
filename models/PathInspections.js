const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const PathEquipments = require('./PathEquipments');
const Inspections = require('./Inspections');

class PathInspections extends Model {}
// 巡检路线设备检查项信息
PathInspections.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-使用的数据 2-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'pathinspections',
	paranoid: true,
	comment: '巡检路线设备检查项信息'
});

PathEquipments.hasMany(PathInspections);
PathInspections.belongsTo(PathEquipments);

Inspections.hasMany(PathInspections);
PathInspections.belongsTo(Inspections);

PathInspections.sync();

module.exports = PathInspections;
