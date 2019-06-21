var crypto = require('crypto');

const util = {
	async wait (mileseconds) {
		console.log('等待中...');
		return new Promise((resolve, reject) => {
			return setTimeout(() => {
				resolve();
			}, mileseconds || 200);
		});
	},
	stringHash (string) {
		try {
			var md5sum = crypto.createHash('md5');
			let hash = md5sum.update(string).digest('hex');
			return hash;
		} catch (error) {
			console.error({ error });
			return '';
		}
	}
};

module.exports = util;
