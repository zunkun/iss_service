const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const DingStaffs = require('./DingStaffs');

class Personnels extends Model {}
// 客户 参与人员表
Personnels.init({
	companyId: {
		type: DataTypes.INTEGER,
		comment: '客户ID'
	},
	companyName: {
		type: DataTypes.STRING,
		comment: '客户名称'
	},
	userId: {
		type: DataTypes.STRING,
		comment: '参与人员userId'
	},
	userName: {
		type: DataTypes.STRING,
		comment: '参与人员姓名'
	},
	avatar: {
		type: DataTypes.STRING,
		comment: '人员头像'
	},
	role: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '人员角色信息, 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员) 50-KAM（客户/区域经理） 60-OE'
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: 'Location表uuid，标识该执行表属于哪个location'
	},
	locationId: {
		type: DataTypes.INTEGER,
		comment: '项目点ID'
	},
	timestamps: { type: DataTypes.BIGINT, comment: '时间戳' },
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '当前人员状态 1-启用中 2-弃用'
	}
}, {
	sequelize: postgres,
	modelName: 'personnels',
	paranoid: true,
	comment: '人物系统角色表'
});

// 员工-执行者身份关系
DingStaffs.hasMany(Personnels);
Personnels.belongsTo(DingStaffs);

Personnels.sync();

module.exports = Personnels;
