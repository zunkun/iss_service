const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Customers = require('./Customers');

class Projects extends Model {}
// 系统用户
Projects.init({
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
	inuse: { // 是否使用中
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	approvalStatus: DataTypes.INTEGER, // 0-待审核 1-已通过 2-已驳回
	approvalTime: DataTypes.DATE
}, {
	getterMethods: {
		address () {
			return this.provinceName + this.cityName + this.districtName + this.street;
		}
	},
	sequelize: postgres,
	modelName: 'projects',
	paranoid: true
});

// 项目客户关系
Customers.hasMany(Projects);
Projects.belongsTo(Customers);
Projects.sync();

module.exports = Projects;
