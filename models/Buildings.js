const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');

// 建筑信息
class Buildings extends Model {}
Buildings.init({
	name: DataTypes.STRING, // 建筑名称
	address: DataTypes.STRING, // 地址
	projectName: DataTypes.STRING
}, {
	sequelize: postgres,
	modelName: 'buildings',
	comment: '建筑信息',
	paranoid: true
});

Projects.hasMany(Buildings);
Buildings.belongsTo(Projects);
Buildings.sync();

module.exports = Buildings;
