const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Pathways = require('./Pathways');
const Personnels = require('./Personnels');

class PathOperate extends Model {}
// 巡检员巡检信息主表
PathOperate.init({
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: '用来标识属于哪个巡检路线，pathway uuid'
	},
	gps: {
		type: DataTypes.STRING,
		comment: '巡检位置'
	},
	date: {
		type: DataTypes.DATEONLY,
		comment: '巡检日期'
	},
	startTime: {
		type: DataTypes.DATE,
		comment: '巡检开始时间'
	},
	endTime: {
		type: Date.DATE,
		comment: '巡检结束时间'
	},
	accomplished: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		comment: '当前巡检路线是否已经巡检所有项'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-巡检中 2-巡检数据已提交'
	}
}, {
	sequelize: postgres,
	modelName: 'pathequipments',
	paranoid: true,
	comment: '巡检路线设备信息'
});

Personnels.hasMany(PathOperate);
PathOperate.belongsTo(Personnels);

Pathways.hasMany(PathOperate);
PathOperate.belongsTo(Pathways);

PathOperate.sync();

module.exports = PathOperate;
