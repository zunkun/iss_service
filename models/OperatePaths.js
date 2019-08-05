const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Pathways = require('./Pathways');
const Personnels = require('./Personnels');
const Locations = require('./Locations');

class OperatePaths extends Model {}
// 巡检员巡检信息主表
OperatePaths.init({
	locationUuid: {
		type: DataTypes.UUID,
		comment: '项目点uuid'
	},
	pathwayUuid: {
		type: DataTypes.UUID,
		comment: '用来标识属于哪个巡检路线，pathway uuid'
	},
	pathwayName: {
		type: DataTypes.STRING,
		comment: '巡检名称'
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
		type: DataTypes.DATE,
		comment: '巡检结束时间'
	},
	accomplished: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		comment: '当前巡检路线是否已经巡检所有项'
	},
	userId: {
		type: DataTypes.STRING,
		comment: '巡检员userId'
	},
	userName: {
		type: DataTypes.STRING,
		comment: '巡检员姓名'
	},
	normal: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		comment: '巡检数据是否正常，当有不正常检查项时，设置此项'
	},
	unnormalInfos: {
		type: DataTypes.ARRAY(DataTypes.STRING),
		comment: '不正常原因'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '1-巡检中 2-巡检数据已提交'
	}

}, {
	sequelize: postgres,
	modelName: 'operatepaths',
	paranoid: true,
	comment: '巡检中路线信息, locationId标识同一locationUuid下location版本，同理可以理解pathwayId和pathwayUuid'
});

Personnels.hasMany(OperatePaths);
OperatePaths.belongsTo(Personnels);

Locations.hasMany(OperatePaths);
OperatePaths.belongsTo(Locations);

Pathways.hasMany(OperatePaths);
OperatePaths.belongsTo(Pathways);

OperatePaths.sync();

module.exports = OperatePaths;
