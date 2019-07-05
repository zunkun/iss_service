const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Spaces = require('./Spaces');

// Facility HISTORY 设备类，OE操作时设定设备类型
class FHSV extends Model {}

FHSV.init({
	code: DataTypes.STRING, // 设备编号
	name: DataTypes.STRING, // 设备名称，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	system: DataTypes.INTEGER, // 设备系统，参考常量中 systemMap
	description: DataTypes.TEXT, // 描述信息
	// svs: DataTypes.ARRAY(DataTypes.JSONB), // sv信息 [{userId: '', userName: ''}]
	inspect: { // 是否需要巡检
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	} // 审批状态 1-编辑中 2-已提交
}, {
	sequelize: postgres,
	modelName: 'fhsvs',
	paranoid: true,
	comment: 'SV选择录入设备信息'
});

FHSV.belongsTo(Projects);
Projects.hasMany(FHSV);
FHSV.belongsTo(Buildings);
Buildings.hasMany(FHSV);
FHSV.belongsTo(Floors);
Floors.hasMany(FHSV);
FHSV.belongsTo(Spaces);
Spaces.hasMany(FHSV);

FHSV.sync();

module.exports = FHSV;
