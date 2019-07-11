const postgres = require('../core/db/postgres');
const { DataTypes, Model, UUIDV4 } = require('sequelize');

const Locations = require('./Locations');
const Buildings = require('./Buildings');
const Floors = require('./Floors');
// const Reviews = require('./Reviews');

// 楼层内空间
class Spaces extends Model {}
Spaces.init({
	uuid: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4
	},
	name: {
		type: DataTypes.STRING,
		comment: '空间名称'
	},
	area: {
		type: DataTypes.FLOAT,
		comment: '面积'
	},
	barcodeentry: {
		type: DataTypes.STRING,
		comment: '编号'
	},
	extwindowarea: {
		type: DataTypes.FLOAT,
		comment: '室外面积'
	},
	inwindowarea: {
		type: DataTypes.FLOAT,
		comment: '室内面积'
	},
	spaceheight: {
		type: DataTypes.FLOAT,
		comment: '空间高度'
	},
	category: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		comment: '当前数据分类 0-sv编辑的数据 1-审批中的数据 2-使用的数据 3-被替换的历史数据'
	}
}, {
	sequelize: postgres,
	modelName: 'spaces',
	paranoid: true,
	comment: '楼层内空间'
});

Locations.hasMany(Spaces);
Spaces.belongsTo(Locations);

// Reviews.hasMany(Spaces);
// Spaces.belongsTo(Reviews);

Buildings.hasMany(Spaces);
Spaces.belongsTo(Buildings);

Floors.hasMany(Spaces);
Spaces.belongsTo(Floors);

Spaces.sync();

module.exports = Spaces;
