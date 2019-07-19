const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Pathways = require('./Pathways');
const Equipments = require('./Equipments');
const Locations = require('./Locations');
const PathEquipments = require('./PathEquipments');

class OperateEquipments extends Model {}
// 巡检员巡检信息主表
OperateEquipments.init({
	locationUuid: {
		type: DataTypes.UUID,
		comment: '项目点uuid'
	},
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: '用来标识属于哪个巡检路线，pathway uuid'
	},
	equipmentUuid: {
		type: DataTypes.UUID,
		comment: '设备uuid'
	}
}, {
	sequelize: postgres,
	modelName: 'operateequipments',
	paranoid: true,
	comment: '巡检中设备信息, locationId标识同一locationUuid下location版本，同理可以理解pathwayId和pathwayUuid, equipmentId, equipmentUuid'
});

Locations.hasMany(OperateEquipments);
OperateEquipments.belongsTo(Locations);

Pathways.hasMany(OperateEquipments);
OperateEquipments.belongsTo(Pathways);

OperateEquipments.belongsTo(Equipments);

OperateEquipments.belongsTo(PathEquipments);

OperateEquipments.sync();

module.exports = OperateEquipments;
