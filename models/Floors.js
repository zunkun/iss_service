const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Buildings = require('./Buildings');
const Projects = require('./Projects');

// 楼层信息
class Floors extends Model {}
Floors.init({
	name: DataTypes.STRING, // 建筑楼层
	address: DataTypes.STRING, // 地址
	projectName: DataTypes.STRING,
	buildingName: DataTypes.STRING
}, {
	sequelize: postgres,
	modelName: 'floors',
	paranoid: true,
	comment: '楼层信息'
});

Projects.hasMany(Floors);
Floors.belongsTo(Projects);
Buildings.hasMany(Floors);
Floors.belongsTo(Buildings);
Floors.sync();

module.exports = Floors;
