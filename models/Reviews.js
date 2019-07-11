const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Companies = require('./Companies');
const Locations = require('./Locations');

class Reviews extends Model {}
// SV提交的项目核验信息
Reviews.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	}, // 0-待审核 1-已通过 2-已驳回
	reviewTime: DataTypes.DATE // 审核时间
}, {
	sequelize: postgres,
	modelName: 'reviews',
	paranoid: true,
	comment: 'SV提交项目信息'
});

// 客户关系
Companies.hasMany(Reviews);
Reviews.belongsTo(Companies);

Locations.hasMany(Reviews);
Reviews.belongsTo(Locations);

Reviews.sync();

module.exports = Reviews;
