process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const jwt = require('jsonwebtoken');

const config = require('../../config');
const DingStaffs = require('../../models/DingStaffs');

const userId = '4508346521365159';

class Auth {
	constructor () {
		this.user = {};
		this.token = null;
	}

	async getUser () {
		if (this.token) {
			return {
				user: this.user,
				token: this.token
			};
		}
		const user = await DingStaffs.findOne({ where: { userId } });

		return {
			user,
			token: 'Bearer ' + jwt.sign({ userId: user.userId, userName: user.userName, jobnumber: user.jobnumber }, config.secret)
		};
	}
}

module.exports = new Auth();
