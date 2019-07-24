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
	buildingUuid: {
		type: DataTypes.UUID,
		comment: 'Building uuid'
	},
	floorUuid: {
		type: DataTypes.UUID,
		comment: '楼层uuid'
	},
	spaceUuid: {
		type: DataTypes.UUID,
		comment: '空间uuid'
	},
	equipmentName: {
		type: DataTypes.STRING,
		comment: '设备名称'
	},
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: '用来标识属于哪个巡检路线，pathway uuid'
	},
	equipmentUuid: {
		type: DataTypes.UUID,
		comment: '设备uuid'
	},
	normal: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		comment: '巡检数据是否正常，当有不正常检查项时，设置此项'
	},
	unnormalInfos: {
		type: DataTypes.ARRAY(DataTypes.STRING),
		comment: '不正常原因'
	}
}, {
	sequelize: postgres,
	modelName: 'operateequipments',
	paranoid: true,
	comment: '巡检中设备信息, locationId标识同一locationUuid下location版本，同理可以理解pathwayId和pathwayUuid, equipmentId, equipmentUuid，当前数据中可能没有pathwayId，因为当前巡检设备可能不在巡检路线中。'
});

// 项目点信息
Locations.hasMany(OperateEquipments);
OperateEquipments.belongsTo(Locations);

// 巡检路线信息
Pathways.hasMany(OperateEquipments);
OperateEquipments.belongsTo(Pathways);

// 设备信息
OperateEquipments.belongsTo(Equipments);

// 巡检路线检查设备信息
OperateEquipments.belongsTo(PathEquipments);

OperateEquipments.sync();

module.exports = OperateEquipments;
