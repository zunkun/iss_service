const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Projects = require('./Projects');
const Reviews = require('./Reviews');

// 建筑信息
class Buildings extends Model {}
Buildings.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	name: DataTypes.STRING, // 建筑名称
	address: DataTypes.STRING, // 地址
	projectName: DataTypes.STRING,
	oesv: { // sv-SV编辑中的数据 oe-OE审核通过的数据
		type: DataTypes.STRING,
		defaultValue: 'sv'
	}
}, {
	sequelize: postgres,
	modelName: 'buildings',
	comment: '建筑信息',
	paranoid: true
});

Projects.hasMany(Buildings);
Buildings.belongsTo(Projects);

Reviews.hasMany(Buildings);
Buildings.belongsTo(Reviews);
Buildings.sync();

module.exports = Buildings;
