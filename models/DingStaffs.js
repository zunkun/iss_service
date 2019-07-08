const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

class DingStaffs extends Model {}
// 系统用户
DingStaffs.init({
	userId: {
		type: DataTypes.STRING,
		unique: true
	}, // 钉钉用户userId
	userName: DataTypes.STRING, // 姓名
	jobnumber: DataTypes.STRING, // 工号
	gender: DataTypes.STRING, // 性别
	avatar: DataTypes.STRING, // 人物图像
	mobile: DataTypes.STRING,
	isAdmin: DataTypes.BOOLEAN,
	isBoss: DataTypes.BOOLEAN,
	position: DataTypes.STRING,
	email: DataTypes.STRING,
	pids: DataTypes.ARRAY(DataTypes.INTEGER), // sv所管理的projectId
	oe: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	role: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	}, // 1-用户 2-管理员 3-超级管理员
	depts: DataTypes.ARRAY(DataTypes.JSONB) // 用户部门信息 [{deptId: DataTypes.String, deptName: DataTypes.String}]
}, { sequelize: postgres, modelName: 'dingstaffs', paranoid: true, comment: '钉钉用户' });

DingStaffs.sync();

module.exports = DingStaffs;
