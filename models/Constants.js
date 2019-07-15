const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 常量信息表
class Constants extends Model {}

Constants.init({
	name: {
		type: DataTypes.STRING,
		comment: '常量名称'
	},
	classfication: {
		type: DataTypes.STRING,
		comment: '常量的分类'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		comment: '数据分类 1-使用中 2-归档常量'
	}
}, { sequelize: postgres, modelName: 'constants', paranoid: true, comment: '常量信息表' });

Constants.sync();

module.exports = Constants;
