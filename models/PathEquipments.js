const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Companies = require('./Companies');
const Pathways = require('./Pathways');
const Equipents = require('./Equipments');
const Locations = require('./Locations');

class PathEquipments extends Model {}
// 巡检路线设备信息
PathEquipments.init({
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: 'pathway uuid'
	},
	equipmentUuid: {
		type: DataTypes.UUID,
		comment: 'equipment uuid'
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: 'location uuid'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-使用的数据 2-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'pathequipments',
	paranoid: true,
	comment: '巡检路线设备信息'
});

PathEquipments.belongsTo(Companies);

Pathways.hasMany(PathEquipments);
PathEquipments.belongsTo(Pathways);

PathEquipments.belongsTo(Equipents);

Locations.hasMany(PathEquipments);
PathEquipments.belongsTo(Locations);

PathEquipments.sync();

module.exports = PathEquipments;
