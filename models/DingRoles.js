const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

class DingRoles extends Model {}
// 系统用户
DingRoles.init({
	roleId: { // 角色Id
		type: DataTypes.INTEGER,
		unique: true
	},
	name: DataTypes.STRING, // 角色Id
	groupId: DataTypes.INTEGER, // 角色组id
	groupName: DataTypes.STRING // 角色组名称
}, { sequelize: postgres, modelName: 'dingroles', timestamps: false, comment: '钉钉角色' });

DingRoles.sync();

module.exports = DingRoles;
