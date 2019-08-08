const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Buildings = require('./Buildings');
const Locations = require('./Locations');
const Constants = require('./Constants');

// 楼层信息
class Floors extends Model {}
Floors.init({
	name: {
		type: DataTypes.STRING,
		comment: '楼层名称'
	}, // 建筑楼层
	level: {
		type: DataTypes.INTEGER,
		comment: '楼层'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	floorClassId: {
		type: DataTypes.INTEGER,
		comment: '楼层类别Id,参考常量表constants'
	},
	isMaintained: {
		type: DataTypes.BOOLEAN,
		comment: '是否需要维护',
		defaultValue: false
	},
	area: {
		type: DataTypes.FLOAT,
		comment: '总面积'
	},
	outerarea: {
		type: DataTypes.FLOAT,
		comment: '外部面积'
	},
	innerarea: {
		type: DataTypes.FLOAT,
		comment: '内部面积'
	},
	createdUserId: {
		type: DataTypes.STRING,
		comment: '创建人钉钉userId'
	},
	createdUserName: {
		type: DataTypes.STRING,
		comment: '创建人姓名'
	},
	companyId: {
		type: DataTypes.STRING,
		comment: '客户ID'
	},
	buildingName: {
		type: DataTypes.STRING,
		comment: '建筑名称'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑 1-启用 2-启用'
	}
}, {
	sequelize: postgres,
	modelName: 'floors',
	paranoid: true,
	comment: '楼层信息'
});

// 保存项目点信息，用作设备信息使用
Locations.hasMany(Floors);
Floors.belongsTo(Locations);

Buildings.hasMany(Floors);
Floors.belongsTo(Buildings);

Floors.belongsTo(Constants, { as: 'floorClass' });

Floors.sync().then(() => {
	// 处理id,id从1000开始自增
	return postgres.query('SELECT setval(\'floors_id_seq\', max(id)) FROM floors;	')
		.then(data => {
			let setval = Number(data[0][0].setval);
			if (setval < 1000) {
				return postgres.query('SELECT setval(\'floors_id_seq\', 1000, true);');
			}
			return Promise.resolve();
		});
});

module.exports = Floors;
