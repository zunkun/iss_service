const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

const Locations = require('./Locations');
const Buildings = require('./Buildings');
const Floors = require('./Floors');

// 楼层内空间
class Spaces extends Model {}
Spaces.init({
	name: {
		type: DataTypes.STRING,
		comment: '空间名称'
	},
	area: {
		type: DataTypes.FLOAT,
		comment: '面积'
	},
	height: {
		type: DataTypes.FLOAT,
		comment: '高度'
	},
	spaceClassId: {
		type: DataTypes.INTEGER,
		comment: '空间类别ID'
	},
	spaceClass: {
		type: DataTypes.STRING,
		comment: '空间类别'
	},
	groundId: {
		type: DataTypes.INTEGER,
		comment: '地面类型ID'
	},
	ground: {
		type: DataTypes.STRING,
		comment: '地面类型'
	},
	materialId: {
		type: DataTypes.INTEGER,
		comment: '材质ID'
	},
	material: {
		type: DataTypes.STRING,
		comment: '材质ID'
	},
	wareNum: {
		type: DataTypes.INTEGER,
		comment: '器具数量'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	},
	isInner: {
		type: DataTypes.BOOLEAN,
		comment: '是否是室内空间'
	},
	isMaintained: {
		type: DataTypes.BOOLEAN,
		comment: '是否需要服务'
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
	floorName: {
		type: DataTypes.STRING,
		comment: '楼层名称'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑 1-启用 2-启用'
	}
}, {
	sequelize: postgres,
	modelName: 'spaces',
	paranoid: true,
	comment: '楼层内空间'
});

Locations.hasMany(Spaces);
Spaces.belongsTo(Locations);

Buildings.hasMany(Spaces);
Spaces.belongsTo(Buildings);

Floors.hasMany(Spaces);
Spaces.belongsTo(Floors);

Spaces.sync().then(() => {
	// 处理id,id从1000开始自增
	return postgres.query('SELECT setval(\'spaces_id_seq\', max(id)) FROM spaces;	')
		.then(data => {
			let setval = Number(data[0][0].setval);
			if (setval < 1000) {
				return postgres.query('SELECT setval(\'spaces_id_seq\', 1000, true);');
			}
			return Promise.resolve();
		});
});

module.exports = Spaces;
