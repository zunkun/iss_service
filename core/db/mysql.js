const Sequelize = require('sequelize');

const env = process.env;

const mysql = new Sequelize(env.database, env.dbUser, env.dbPassword, {
	host: env.dbHost,
	dialect: 'mysql',
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

mysql
	.authenticate()
	.then(() => {
		console.log('【成功】mysql数据库连接成功');
	})
	.catch(err => {
		console.error('【失败】mysql数据库连接失败:', err);
	});

mysql.sync();

module.exports = mysql;
