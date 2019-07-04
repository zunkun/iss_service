const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Projects = require('./Projects');

// 楼层内空间
class Spaces extends Model {}
Spaces.init({
	name: DataTypes.STRING, // 建筑楼层
	address: DataTypes.STRING, // 地址
	projectName: DataTypes.STRING,
	buildingName: DataTypes.STRING,
	floorName: DataTypes.STRING
}, {
	sequelize: postgres,
	modelName: 'spaces',
	paranoid: true,
	comment: '楼层内空间'
});

Projects.hasMany(Spaces);
Spaces.belongsTo(Projects);
Buildings.hasMany(Spaces);
Spaces.belongsTo(Buildings);
Floors.hasMany(Spaces);
Spaces.belongsTo(Floors);

Spaces.sync();

module.exports = Spaces;
