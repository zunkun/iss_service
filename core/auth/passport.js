
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('../../models/Users');
const { stringHash } = require('../util');

passport.use(new LocalStrategy({
	usernameField: 'phone'
}, async (phone, password, done) => {
	let user = await Users.findOne({ where: { phone } });
	if (!user) {
		console.log(`系统没有${phone}用户`);
		done(null, false);
		return;
	}
	// 系统默认管理员账户和密码
	if (phone === '15618871296' && password === 'abcd1234') {
		console.log('超级管理员账户，登录成功');
		done(null, user);
		return;
	}

	let hashedPassword = stringHash(password);
	if (user.password === hashedPassword) {
		console.log('鉴权成功，用户名和密码正确');
		done(null, user);
		return;
	}
	console.log('鉴权失败，密码不正确');
	done(null, false);
}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const user = await Users.findOne({ where: { id } });
	done(null, user);
});

module.exports = passport;
