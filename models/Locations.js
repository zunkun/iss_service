const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Companies = require('./Companies');
const Constants = require('./Constants');

class Locations extends Model {}
// 项目点Location信息
Locations.init({
	name: {
		type: DataTypes.STRING,
		comment: '项目点名称'
	},
	pinyin: { type: DataTypes.STRING, comment: 'pinyin' },
	costcenter: {
		type: DataTypes.STRING,
		comment: '项目编号（财务编号）'
	}, // 项目编号
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
	area: {
		type: DataTypes.INTEGER,
		comment: '总面积'
	},
	unit: {
		type: DataTypes.STRING,
		comment: '测量单位'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	zippostal: {
		type: DataTypes.STRING,
		comment: '邮编'
	},
	parkingOpen: {
		type: DataTypes.INTEGER,
		comment: '停车位数量'
	},
	propertyClassId: {
		type: DataTypes.INTEGER,
		comment: '项目点类别ID'
	},
	createdUserId: {
		type: DataTypes.STRING,
		comment: '创建人钉钉userId'
	},
	createdUserName: {
		type: DataTypes.STRING,
		comment: '创建人姓名'
	},
	companyName: {
		type: DataTypes.STRING,
		comment: '客户名称'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-草稿 1-启用 2-弃用'
	}
}, {
	sequelize: postgres,
	modelName: 'locations',
	paranoid: true,
	comment: '项目点Location信息'
});

Companies.hasMany(Locations);
Locations.belongsTo(Companies);

Locations.belongsTo(Constants, { as: 'propertyClass' });

Locations.sync().then(() => {
	// 处理id,id从1000开始自增
	return postgres.query('SELECT setval(\'locations_id_seq\', max(id)) FROM locations;	')
		.then(data => {
			let setval = Number(data[0][0].setval);
			if (setval < 1000) {
				return postgres.query('SELECT setval(\'locations_id_seq\', 1000, true);');
			}
			return Promise.resolve();
		});
});

module.exports = Locations;
