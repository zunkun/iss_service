const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const Projects = require('./Projects');

// 巡检路线
class Pathways extends Model {}
Pathways.init({
	name: DataTypes.STRING, // 路线名称
	description: DataTypes.STRING, // 路线描述
	date: DataTypes.DATEONLY, // 巡检时间
	weekends: DataTypes.STRING, // 星期几
	inspector: DataTypes.ARRAY(DataTypes.JSONB), // 巡检员 [{userId: '', userName: ''}]
	startTime: DataTypes.DATE, // 开始时间(保留)
	endTime: DataTypes.DATE, // 结束时间(保留)
	oe: DataTypes.JSON, // 当前路线的OE
	svs: DataTypes.ARRAY(DataTypes.JSONB), // 当前路线的svs 和projects同步
	inuse: { // 是否启用
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
}, {
	sequelize: postgres,
	modelName: 'pathways',
	comment: '巡检路线',
	paranoid: true
});

Projects.hasMany(Pathways);
Pathways.belongsTo(Projects);

Pathways.sync();

module.exports = Pathways;
