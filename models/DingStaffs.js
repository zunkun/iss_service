const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

class DingStaffs extends Model {}
// 系统用户
DingStaffs.init({
	userId: {
		type: DataTypes.STRING,
		unique: true,
		comment: '钉钉用户userId'
	}, // 钉钉用户userId
	userName: {
		type: DataTypes.STRING,
		comment: '姓名'
	}, // 姓名
	jobnumber: {
		type: DataTypes.STRING,
		comment: '工号'
	}, // 工号
	avatar: {
		type: DataTypes.STRING,
		comment: '人物图像'
	}, // 人物图像
	mobile: {
		type: DataTypes.STRING,
		comment: '手机'
	},
	oe: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		comment: '是否是oe角色'
	},
	role: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '系统角色，1-用户 2-管理员 3-超级管理员，该角色不是指OE/SV/执行人等角色，而是作为后期系统管理使用'
	}, // 1-用户 2-管理员 3-超级管理员
	depts: {
		type: DataTypes.ARRAY(DataTypes.JSONB),
		comment: '用户部门信息 [{deptId: DataTypes.String, deptName: DataTypes.String}]'
	} //
}, { sequelize: postgres, modelName: 'dingstaffs', timestamps: false, comment: '钉钉用户' });

DingStaffs.sync();

module.exports = DingStaffs;
