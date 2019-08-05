const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const PathEquipments = require('./PathEquipments');
const Inspections = require('./Inspections');
const Pathways = require('./Pathways');

class PathInspections extends Model {}
// 巡检路线设备检查项信息
PathInspections.init({
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: 'pathway uuid'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
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

PathInspections.belongsTo(Pathways);

PathInspections.belongsTo(Inspections);

PathInspections.sync();

module.exports = PathInspections;
