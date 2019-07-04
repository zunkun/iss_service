const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Spaces = require('./Spaces');

// Facility IN USE 设备类，OE操作时设定设备类型
class FU extends Model {}

FU.init({
	code: DataTypes.STRING, // 设备编号
	name: DataTypes.STRING, // 设备名称，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	system: DataTypes.INTEGER, // 设备系统，参考常量中 systemMap
	description: DataTypes.TEXT, // 描述信息
	svs: DataTypes.ARRAY(DataTypes.JSONB), // sv信息 [{userId: '', userName: ''}]
	inspect: { // 是否需要巡检
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
}, {
	sequelize: postgres,
	modelName: 'fus',
	paranoid: true,
	comment: '审核通过设备信息'
});

FU.belongsTo(Projects);
FU.belongsTo(Buildings);
FU.belongsTo(Floors);
FU.belongsTo(Spaces);

FU.sync();

module.exports = FU;
