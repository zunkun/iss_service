const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 钉钉组织同步记录
class Syncs extends Model {}

Syncs.init({
	date: {
		type: DataTypes.DATEONLY,
		unique: true
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	} // 0-没有同步 1-同步成功 2-同步失败
}, { sequelize: postgres, modelName: 'syncs', comment: '钉钉组织架构同步记录' });

Syncs.sync();

module.exports = Syncs;
