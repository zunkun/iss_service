const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');

// Facility Collection 设备类，OE操作时设定设备类型
class FC extends Model {}

FC.init({
	name: DataTypes.STRING, // 设备类别，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	system: DataTypes.INTEGER, // 设备系统，参考常量中 systemMap
	description: DataTypes.TEXT // 描述信息
}, {
	sequelize: postgres,
	modelName: 'fcs',
	paranoid: true,
	comment: 'OE设备类型'
});

Projects.hasMany(FC);
FC.belongsTo(Projects);

FC.sync();

module.exports = FC;
