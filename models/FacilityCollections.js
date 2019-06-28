const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Buildings = require('./Spaces');
const Floors = require('./Spaces');
const Spaces = require('./Spaces');
const Projects = require('./Projects');

// 设备信息
class FacilityCollections extends Model {}

FacilityCollections.init({
	uuid: { // 提交流水
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	code: DataTypes.STRING, // 设备编号
	qrcode: DataTypes.STRING, // 设备二维码
	name: DataTypes.STRING, // 设备名称
	system: DataTypes.INTEGER, // 设备系统
	catalog: DataTypes.INTEGER, // 设备类别
	description: DataTypes.TEXT, // 描述信息
	inspect: DataTypes.BOOLEAN, // 是否需要巡检
	buildingName: DataTypes.STRING,
	floorName: DataTypes.STRING,
	spaceName: DataTypes.STRING,
	address: DataTypes.STRING, // 地址
	inspectionIds: DataTypes.ARRAY(DataTypes.INTEGER) // 使用中设备巡检项目id表
}, {
	sequelize: postgres,
	modelName: 'facilities',
	paranoid: true,
	comment: '设备信息'
});

Projects.hasMany(FacilityCollections);
FacilityCollections.belongsTo(Projects);
Buildings.hasMany(FacilityCollections);
FacilityCollections.belongsTo(Buildings);
Floors.hasMany(FacilityCollections);
FacilityCollections.belongsTo(Floors);
Spaces.hasMany(FacilityCollections);
FacilityCollections.belongsTo(Spaces);
FacilityCollections.sync();

module.exports = FacilityCollections;
