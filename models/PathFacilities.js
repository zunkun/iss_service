const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');
const Pathways = require('./Pathways');
const Spaces = require('./Spaces');

// 巡检路线检查设备
class PathFacilities extends Model {}
PathFacilities.init({
	inspectCode: DataTypes.STRING, // 执行code
	code: DataTypes.STRING, // 设备编码
	qrcode: DataTypes.STRING, // 设备QR code
	spaceName: DataTypes.STRING,
	facilityName: DataTypes.STRING,
	sequence: DataTypes.INTEGER, // 排序
	remark: DataTypes.INTEGER, // 备注
	startTime: DataTypes.INTEGER, // 开始时间
	endTime: DataTypes.INTEGER, // 结束时间
	status: DataTypes.BOOLEAN, // false-巡检中 true-巡检完成
	inspector: DataTypes.JSONB // 执行人 {userId: '',userName: ''}
}, {
	sequelize: postgres,
	modelName: 'pathinspections',
	comment: '巡检路线检查设备',
	paranoid: true
});

Projects.hasMany(PathFacilities);
PathFacilities.belongsTo(Projects);

Pathways.hasMany(PathFacilities);
PathFacilities.belongsTo(Pathways);

Spaces.hasMany(PathFacilities);
PathFacilities.belongsTo(Spaces);

PathFacilities.sync();

module.exports = PathFacilities;
