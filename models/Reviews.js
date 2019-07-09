const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Customers = require('./Customers');
const Projects = require('./Projects');

class Reviews extends Model {}
// SV提交的项目核验信息
Reviews.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	code: DataTypes.STRING, // 项目编号
	name: DataTypes.STRING, // 项目名称
	customerName: DataTypes.STRING, // 客户名称
	provinceCode: DataTypes.STRING, // 省
	provinceName: DataTypes.STRING,
	cityCode: DataTypes.STRING, // 市
	cityName: DataTypes.STRING,
	districtCode: DataTypes.STRING, // 区县
	districtName: DataTypes.STRING,
	street: DataTypes.STRING,
	svs: DataTypes.ARRAY(DataTypes.JSONB), // 主管列表 [{userId: '', userName: '', avatar: '', phone: ''}]
	oe: DataTypes.JSONB, // 创建
	tosv: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}, // 是否下发主管
	toTime: DataTypes.DATE, // 下发主管时间
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
