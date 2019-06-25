const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Buildings = require('./Buildings');

// 楼层信息
class Floors extends Model {}
Floors.init({
	name: DataTypes.STRING, // 建筑楼层
	address: DataTypes.STRING // 地址
}, {
	sequelize: postgres,
	modelName: 'floors',
	paranoid: true
});

Buildings.hasMany(Floors);
Floors.sync();

module.exports = Floors;
