const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');
const Pathways = require('./Pathways');
const Spaces = require('./Spaces');
const PathFacilities = require('./PathFacilities');

// 巡检设备检查项目
class PathInspections extends Model {}

PathInspections.init({
	inspectionName: DataTypes.STRING,
	datatype: DataTypes.INTEGER, // 数据类型 1-状态 2-数值
	state: DataTypes.INTEGER, // 检查项目状态，四种状态 [1-2-3-4]
	normal: DataTypes.INTEGER, // 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
	high: DataTypes.INTEGER,
	low: DataTypes.INTEGER,
	value: DataTypes.INTEGER, // 项目数值
	startTime: DataTypes.INTEGER, // 开始时间
	endTime: DataTypes.INTEGER, // 结束时间
	remark: DataTypes.STRING, // 备注
	status: DataTypes.BOOLEAN // false-巡检中 true-巡检完成
}, {
	sequelize: postgres,
	modelName: 'pathinspections',
	comment: '巡检设备检查项目',
	paranoid: true
});

Projects.hasMany(PathInspections);
PathInspections.belongsTo(Projects);

Pathways.hasMany(PathInspections);
PathInspections.belongsTo(Pathways);

Spaces.hasMany(PathInspections);
PathInspections.belongsTo(Spaces);

PathFacilities.hasMany(PathInspections);
PathInspections.belongsTo(PathFacilities);

PathInspections.sync();

module.exports = PathInspections;
