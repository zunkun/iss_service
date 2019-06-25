const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 钉钉组织架构
class DingDepts extends Model {}
DingDepts.init({
	deptId: {
		type: DataTypes.INTEGER,
		unique: true
	}, // 钉钉部门deptId
	deptName: DataTypes.STRING, // 部门名称
	managers: DataTypes.ARRAY(DataTypes.JSON) // 部门主管
}, { sequelize: postgres, modelName: 'dingdepts', paranoid: true });

DingDepts.sync();

module.exports = DingDepts;
