const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 客户信息表
class Customers extends Model {}
Customers.init({
	name: DataTypes.STRING, // 名称
	industryCode: DataTypes.STRING, // 行业
	industryName: DataTypes.STRING,
	site: DataTypes.STRING, // 网址
	email: DataTypes.STRING,
	mobile: DataTypes.STRING
}, { sequelize: postgres, modelName: 'customers', paranoid: true });

Customers.sync();

module.exports = Customers;
