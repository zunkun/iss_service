const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Spaces = require('./Spaces');

// Facility HISTORY 设备类，OE操作时设定设备类型
class FH extends Model {}

FH.init({
	code: DataTypes.STRING, // 设备编号
	name: DataTypes.STRING, // 设备名称，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	system: DataTypes.INTEGER, // 设备系统，参考常量中 systemMap
	description: DataTypes.TEXT, // 描述信息
	svs: DataTypes.ARRAY(DataTypes.JSONB), // sv信息 [{userId: '', userName: ''}]
	inspect: { // 是否需要巡检
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	} // 审批状态 0-编辑中 1-审批中 2-审批通过 3-OE拒绝
}, {
	sequelize: postgres,
	modelName: 'fcs',
	paranoid: true,
	comment: 'SV写入待审批设备'
});

FH.belongsTo(Projects);
FH.belongsTo(Buildings);
FH.belongsTo(Floors);
FH.belongsTo(Spaces);

FH.sync();

module.exports = FH;
