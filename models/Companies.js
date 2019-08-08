const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 组织信息表
class Companies extends Model {}

Companies.init({
	name: {
		type: DataTypes.STRING,
		comment: '客户名称',
		allowNull: false
	}, // 名称
	shortname: {
		type: DataTypes.STRING,
		comment: '名称缩写'
	},
	pinyin: {
		type: DataTypes.JSONB,
		comment: '拼音' // {name: '', shortname: ''}
	},
	costcenter: {
		type: DataTypes.STRING,
		comment: '客户代码（财务编号）'
	},
	industryId: {
		type: DataTypes.INTEGER,
		comment: '行业id'
	}, // 行业id
	industryName: {
		type: DataTypes.STRING,
		comment: '行业名称'
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
	email: {
		type: DataTypes.STRING,
		comment: '邮箱'
	},
	mainphone: {
		type: DataTypes.STRING,
		comment: '电话总机'
	},
	zippostal: {
		type: DataTypes.STRING,
		comment: '邮编'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	createdUserId: {
		type: DataTypes.STRING,
		comment: '创建人钉钉userId'
	},
	createdUserName: {
		type: DataTypes.STRING,
		comment: '创建人姓名'
	},
	status: {
		type: DataTypes.INTEGER,
		comment: '当前客户数据状态 0-编辑中 1-启用 2-停用中',
		defaultValue: 0
	}
}, { sequelize: postgres, modelName: 'company', paranoid: true, comment: '组织信息表' });

Companies.sync().then(() => {
	// 处理id,id从1000开始自增
	return postgres.query('SELECT setval(\'companies_id_seq\', max(id)) FROM companies;	')
		.then(data => {
			let setval = Number(data[0][0].setval);
			if (setval < 1000) {
				return postgres.query('SELECT setval(\'companies_id_seq\', 1000, true);');
			}
			return Promise.resolve();
		});
});

module.exports = Companies;
