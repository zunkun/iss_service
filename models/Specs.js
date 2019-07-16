const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Constants = require('./Constants');

//  设备类，OE操作时设定设备类型
class Specs extends Model {}

Specs.init({
	name: {
		type: DataTypes.STRING,
		comment: '设备类名称'
	}, // 设备类别，比如高压开关柜、高压电容补偿柜、变压器，低压开关柜等
	brandId: {
		type: DataTypes.INTEGER,
		comment: '品牌编号ID，参考constants'
	},
	buildingSystemId: {
		type: DataTypes.INTEGER,
		comment: '建筑系统分类id，参考constants'
	},
	serviceClassId: {
		type: DataTypes.INTEGER,
		comment: '服务类别id，参考constants'
	},
	specClassId: {
		type: DataTypes.INTEGER,
		comment: '规格分类id，参考constants'
	},
	description: {
		type: DataTypes.TEXT,
		comment: '描述'
	}
}, {
	sequelize: postgres,
	modelName: 'specs',
	paranoid: true,
	comment: '设备分类'
});

Specs.belongsTo(Constants, { as: 'brand' });
Specs.belongsTo(Constants, { as: 'buildingSystem' });
Specs.belongsTo(Constants, { as: 'serviceClass' });
Specs.belongsTo(Constants, { as: 'specClass' });

Specs.sync();

module.exports = Specs;
