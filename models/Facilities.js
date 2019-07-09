const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Projects = require('./Projects');
const Reviews = require('./Reviews');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Spaces = require('./Spaces');

// Facility 设备信息
class Facilities extends Model {}

Facilities.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	code: DataTypes.STRING, // 设备编号
	name: DataTypes.STRING, // 设备名称，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	system: DataTypes.INTEGER, // 设备系统，参考常量中 systemMap
	description: DataTypes.TEXT, // 描述信息
	inspect: { // 是否需要巡检
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	}, // 审批状态 1-编辑中 2-已提交
	fcId: DataTypes.INTEGER,
	fcName: DataTypes.STRING,
	oesv: { // sv-SV编辑中的数据 oe-OE审核通过的数据
		type: DataTypes.STRING,
		defaultValue: 'sv'
	}
}, {
	sequelize: postgres,
	modelName: 'facilities',
	paranoid: true,
	comment: 'SV选择录入设备信息'
});

Facilities.belongsTo(Projects);
Projects.hasMany(Facilities);

Facilities.belongsTo(Reviews);
Reviews.hasMany(Facilities);

Facilities.belongsTo(Buildings);
Buildings.hasMany(Facilities);

Facilities.belongsTo(Floors);
Floors.hasMany(Facilities);

Facilities.belongsTo(Spaces);
Spaces.hasMany(Facilities);

Facilities.sync();

module.exports = Facilities;
