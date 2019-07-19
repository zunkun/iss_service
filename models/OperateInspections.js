const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const OperatePaths = require('./OperatePaths');
const PathEquipments = require('./PathEquipments');
const PathInspections = require('./PathInspections');
const Locations = require('./Locations');
const Pathways = require('./Pathways');
const Equipments = require('./Equipments');
const Inspections = require('./Inspections');
const OperateEquipments = require('./OperateEquipments');

class OperateInspections extends Model {}
// 巡检设备数据记录
OperateInspections.init({
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
	},
	inspectionUuid: {
		type: DataTypes.UUID,
		comment: '设备uuid'
	},
	state: {
		type: DataTypes.INTEGER,
		comment: '设备状态编号, 1-stateA 2-stateB 3-stateC 4-stateD'
	},
	value: {
		type: DataTypes.DOUBLE,
		comment: '录入数据内容'
	},
	normal: {
		type: DataTypes.BOOLEAN,
		comment: '当前检查项是否正常'
	},
	remark: {
		type: DataTypes.TEXT,
		comment: '备注'
	},
	images: {
		type: DataTypes.ARRAY(DataTypes.STRING),
		comment: '巡检内容图片（保留字段）'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-巡检中 2-巡检数据已提交'
	}
}, {
	sequelize: postgres,
	modelName: 'operateinspections',
	paranoid: true,
	comment: '巡检设备数据记录'
});

OperateInspections.belongsTo(OperatePaths);
OperateInspections.belongsTo(OperateEquipments);

// 如果设备在巡检路线中，有如下两个参数
OperateInspections.belongsTo(PathEquipments);
OperateInspections.belongsTo(PathInspections);

OperateInspections.belongsTo(Locations);
OperateInspections.belongsTo(Pathways);
OperateInspections.belongsTo(Equipments);
OperateInspections.belongsTo(Inspections);

OperateInspections.sync();

module.exports = OperateInspections;
