const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Companies = require('./Companies');
const Pathways = require('./Pathways');
const Equipents = require('./Equipments');

class PathEquipments extends Model {}
// 巡检路线设备信息
PathEquipments.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '1-使用的数据 2-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'pathequipments',
	paranoid: true,
	comment: '巡检路线设备信息'
});

Companies.hasMany(PathEquipments);
PathEquipments.belongsTo(Companies);

Pathways.hasMany(PathEquipments);
PathEquipments.belongsTo(Pathways);

Equipents.hasMany(PathEquipments);
PathEquipments.belongsTo(Equipents);

PathEquipments.sync();

module.exports = PathEquipments;
