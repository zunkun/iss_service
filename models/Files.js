const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');

// 文件schema
class Files extends Model {}

Files.init({
	type: {
		type: DataTypes.STRING,
		comment: '上传文件类型'
	},
	name: {
		type: DataTypes.STRING,
		comment: '本地保存文件名称'
	},
	origin: {
		type: DataTypes.STRING,
		comment: '文件原来名称'
	},
	userId: {
		type: DataTypes.STRING, // 文件上传者userId
		comment: '文件上传者userId'
	},
	userName: {
		type: DataTypes.STRING,
		comment: '文件上传者名称'
	},
	status: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	} // 0-上传成功 1-解析成功  2-解析失败
}, { sequelize: postgres, modelName: 'files', comment: '钉钉组织架构同步记录' });

Files.sync();
module.exports = Files;
