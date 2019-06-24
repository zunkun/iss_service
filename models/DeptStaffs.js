const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const DingDepts = require('./DingDepts');
const DingStaffs = require('./DingStaffs');

// 钉钉组织架构与人员对应关系
class DeptStaffs extends Model {}
DeptStaffs.init({
	userId: {
		type: DataTypes.STRING,
		unique: 'deptstaff'
	},
	deptId: {
		type: DataTypes.INTEGER,
		unique: 'deptstaff'
	},
	userName: DataTypes.STRING,
	deptName: DataTypes.STRING
}, { sequelize: postgres, modelName: 'deptstaffs' });

DeptStaffs.belongsTo(DingDepts, { foreignKey: 'dingdeptId' });
DeptStaffs.belongsTo(DingStaffs, { foreignKey: 'dingstaffId' });

DeptStaffs.sync();

module.exports = DeptStaffs;
