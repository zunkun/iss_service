const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Facilities = require('./Facilities');

// 设备信息检查项目
class Inspections extends Model {}
Inspections.init({
	name: DataTypes.STRING, // 检查项目名称
	frequency: DataTypes.INTEGER, // 建议频率 1-每班 2-每周 3-每月 4-每年
	datatype: {
		type: DataTypes.INTEGER,
		allowNull: false
	}, // 录入数据类型 1-选择项目 2-信息录入
	statusA: DataTypes.STRING, // 状态A
	statusB: DataTypes.STRING, // 状态B
	statusC: DataTypes.STRING, // 状态C
	statusD: DataTypes.STRING, // 状态D
	normal: DataTypes.INTEGER, // 正确的状态 1-statusA 2-statusB 3-statusC 4-statusD
	unit: DataTypes.STRING, // 录入数据单位
	high: DataTypes.STRING, // 上限
	tipHigh: DataTypes.STRING, // 上限提示语
	low: DataTypes.STRING, // 下限
	tipLow: DataTypes.STRING, // 下限提示语
	remark: DataTypes.STRING // 备注
}, {
	sequelize: postgres,
	modelName: 'facilities',
	paranoid: true
});

Facilities.hasMany(Inspections);
Inspections.belongsTo(Facilities);

Inspections.sync();

module.exports = Inspections;
