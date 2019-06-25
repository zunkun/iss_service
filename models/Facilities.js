const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Spaces = require('./Spaces');

// 设备信息
class Facilities extends Model {}
Facilities.init({
	code: DataTypes.STRING, // 设备编号
	name: DataTypes.STRING, // 设备名称
	system: DataTypes.INTEGER, // 设备系统
	catalog: DataTypes.INTEGER, // 设备类别
	description: DataTypes.TEXT, // 描述信息
	examine: DataTypes.BOOLEAN, // 是否需要巡检
	address: DataTypes.STRING // 地址
}, {
	sequelize: postgres,
	modelName: 'facilities',
	paranoid: true
});

Spaces.hasMany(Facilities);
Facilities.sync();

module.exports = Facilities;
