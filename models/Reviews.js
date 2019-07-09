const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Customers = require('./Customers');
const Projects = require('./Projects');

class Reviews extends Model {}
// SV提交的项目核验信息
Reviews.init({
	project: DataTypes.JSONB, // 项目日志
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	}, // 0-待审核 1-已通过 2-已驳回
	reviewTime: DataTypes.DATE // 审核时间
}, {
	getterMethods: {
		address () {
			return this.provinceName + this.cityName + this.districtName + this.street;
		}
	},
	sequelize: postgres,
	modelName: 'reviews',
	paranoid: true,
	comment: 'SV提交项目信息'
});

// 项目客户关系
Customers.hasMany(Reviews);
Reviews.belongsTo(Customers);

Projects.hasMany(Reviews);
Reviews.belongsTo(Projects, { as: 'projecthistory' });

Reviews.sync();

module.exports = Reviews;
