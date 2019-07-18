var crypto = require('crypto');
const Equipments = require('../../models/Equipments');
const Inspections = require('../../models/Inspections');

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
	},

	async getEI (id) {
		let equipment = await Equipments.findOne({ where: { id } });
		if (!equipment) {
			return Promise.reject('参数错误');
		}

		let inspections = await Inspections.findAll({ where: { specId: equipment.specId } });
		let res = [];
		for (let inspect of inspections || []) {
			res.push(inspect.id);
		}
		return res;
	}
};

module.exports = util;
