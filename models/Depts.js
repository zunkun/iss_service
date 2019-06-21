const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

class Depts extends Model {}

Depts.init({
	deptId: {
		type: DataTypes.INTEGER,
		unique: true
	}, // 钉钉部门deptId
	deptName: DataTypes.STRING, // 部门名称
	managers: DataTypes.ARRAY(DataTypes.JSON) // 部门主管
}, { sequelize: postgres });

Depts.sync();

module.exports = Depts;
