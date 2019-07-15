const Constants = require('../../models/Constants');

class ConstantUtil {
	async getConstants (classfication) {
		let res = [];
		if (!classfication) {
			return res;
		}
		res = await Constants.findAll({
			attributes: [ 'id', 'classfication', 'name' ],
			where: { classfication },
			raw: true
		}) || [];
		return res;
	}
}

const constants = new ConstantUtil();

module.exports = constants;
