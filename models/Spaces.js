const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');

const Buildings = require('./Buildings');
const Floors = require('./Floors');
const Projects = require('./Projects');
const Reviews = require('./Reviews');

// 楼层内空间
class Spaces extends Model {}
Spaces.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	name: DataTypes.STRING, // 建筑楼层
	address: DataTypes.STRING, // 地址
	projectName: DataTypes.STRING,
	buildingName: DataTypes.STRING,
	floorName: DataTypes.STRING,
	oesv: { // sv-SV编辑中的数据 oe-OE审核通过的数据
		type: DataTypes.STRING,
		defaultValue: 'sv'
	}
}, {
	sequelize: postgres,
	modelName: 'spaces',
	paranoid: true,
	comment: '楼层内空间'
});

Projects.hasMany(Spaces);
Spaces.belongsTo(Projects);

Reviews.hasMany(Spaces);
Spaces.belongsTo(Reviews);

Buildings.hasMany(Spaces);
Spaces.belongsTo(Buildings);

Floors.hasMany(Spaces);
Spaces.belongsTo(Floors);

Spaces.sync();

module.exports = Spaces;
