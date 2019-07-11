const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const DingStaffs = require('./DingStaffs');

class Personnels extends Model {}
// Location 参与人员表
Personnels.init({
	userId: {
		type: DataTypes.STRING,
		comment: '任务执行者userId'
	},
	userName: {
		type: DataTypes.STRING,
		comment: '执行者姓名'
	},
	locationUuid: {
		type: DataTypes.UUID,
		comment: 'Location表uuid，标识该执行表属于哪个location'
	},
	role: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '人员角色信息, 1-执行者operator 2-sv 3-manager 4-oe，通常oe不保存，因为oe在dingstaff中'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '是否在当前巡检路线中 1-巡检员在巡检路线中 2-巡检员被移除巡检路线'
	}
}, {
	sequelize: postgres,
	modelName: 'personnels',
	paranoid: true,
	comment: 'Location参与人员角色关系表'
});

// 员工-执行者身份关系
DingStaffs.hasMany(Personnels);
Personnels.belongsTo(DingStaffs);

Personnels.sync();

module.exports = Personnels;
