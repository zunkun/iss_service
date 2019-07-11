const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const PathOperate = require('./PathOperate');
const PathEquipments = require('./PathEquipments');
const PathInspections = require('./PathInspections');

class OperateRecords extends Model {}
// 巡检设备数据记录
OperateRecords.init({
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: '用来标识属于哪个巡检路线，pathway uuid'
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
	modelName: 'operaterecords',
	paranoid: true,
	comment: '巡检设备数据记录'
});

PathOperate.hasMany(OperateRecords);
OperateRecords.belongsTo(PathOperate);

PathEquipments.hasMany(OperateRecords);
OperateRecords.belongsTo(PathEquipments);

PathInspections.hasMany(OperateRecords);
OperateRecords.belongsTo(PathInspections);

OperateRecords.sync();

module.exports = OperateRecords;
