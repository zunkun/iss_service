const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Buildings = require('./Buildings');
const Floors = require('./Floors');

// 楼层内空间
class Spaces extends Model {}
Spaces.init({
	name: DataTypes.STRING, // 建筑楼层
	address: DataTypes.STRING // 地址
}, {
	sequelize: postgres,
	modelName: 'Spaces',
	paranoid: true
});

Buildings.hasMany(Spaces);
Floors.hasMany(Spaces);

Spaces.sync();

module.exports = Spaces;
