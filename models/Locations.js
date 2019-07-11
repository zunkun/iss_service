const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');
const Companies = require('./Companies');
const Constants = require('./Constants');

class Locations extends Model {}
// 位置Location信息
Locations.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	code: {
		type: DataTypes.STRING,
		comment: '项目编号（财务编号）'
	}, // 项目编号
	name: {
		type: DataTypes.STRING,
		comment: '项目点名称'
	},
	provinceCode: {
		type: DataTypes.STRING,
		comment: '省份code'
	}, // 省
	provinceName: {
		type: DataTypes.STRING,
		comment: '省份名称'
	},
	cityCode: {
		type: DataTypes.STRING,
		comment: '城市code'
	}, // 市
	cityName: {
		type: DataTypes.STRING,
		comment: '城市名称'
	},
	districtCode: {
		type: DataTypes.STRING,
		comment: '区县code'
	},
	districtName: {
		type: DataTypes.STRING,
		comment: '区县名称'
	},
	street: {
		type: DataTypes.STRING,
		comment: '详细地址'
	},
	areaUnitId: {
		type: DataTypes.INTEGER,
		comment: '单位Id,参考常量表constants单位Id,参考常量表constants'
	},
	commonName: {
		type: DataTypes.STRING,
		comment: '通用名称'
	},
	costcenter: {
		type: DataTypes.STRING,
		comment: '成本中心'
	},
	currencyId: {
		type: DataTypes.INTEGER,
		comment: '货币Id,参考常量表constants'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	geographyLookupId: {
		type: DataTypes.INTEGER,
		comment: '城市-地理表Id,参考常量表constants'
	},
	legalName: {
		type: DataTypes.STRING,
		comment: '法律名称'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	parkingOpen: {
		type: DataTypes.INTEGER,
		comment: '停车位数量'
	},
	primaryUseId: {
		type: DataTypes.INTEGER,
		comment: '主要用途Id,参考常量表constants'
	},
	propertyClassId: {
		type: DataTypes.INTEGER,
		comment: '类别Id,参考常量表constants'
	},
	zippostal: {
		type: DataTypes.STRING,
		comment: '邮编'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据'
	}
}, {
	getterMethods: {
		address () {
			return this.provinceName + this.cityName + this.districtName + this.street;
		}
	},
	sequelize: postgres,
	modelName: 'locations',
	paranoid: true,
	comment: '位置Location信息'
});

Companies.hasMany(Locations);
Locations.belongsTo(Companies);

Locations.belongsTo(Constants, { as: 'areaUnit' });
Locations.belongsTo(Constants, { as: 'currency' });
Locations.belongsTo(Constants, { as: 'geographyLookup' });
Locations.belongsTo(Constants, { as: 'primaryUse' });
Locations.belongsTo(Constants, { as: 'propertyClass' });

Locations.sync();

module.exports = Locations;
