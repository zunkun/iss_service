const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Depts = require('./Depts');

class Staffs extends Model {}

// 系统用户
Staffs.init({
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
	role: DataTypes.INTEGER, // 1-技术员 2-SV 3-OE 4-超级管理员
	depts: DataTypes.ARRAY(DataTypes.JSON) // 用户部门信息 [{deptId: DataTypes.String, deptName: DataTypes.String}]
}, { sequelize: postgres });

Staffs.belongsTo(Depts);

Staffs.sync();

module.exports = Staffs;
