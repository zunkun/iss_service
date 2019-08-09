const Constants = require('../../models/Constants');

class ConstantUtil {
	constructor () {
		this.constMap = new Map();
	}
	/**
	 * 获取某种类型常量列表
	 * @param {String} classfication 常量分类
	 */
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

	async initConstMaps () {
		let constants = await Constants.findAll({});
		for (let constant of constants) {
			this.constMap.set(constant.id, constant.name);
		}
	}

	/**
	 * 设置常量Map
	 * @param {number} id 常量id
	 * @param {String} name 常量名称
	 */
	setMap (id, name) {
		this.constMap.set(id, name);
	}

	/**
	 * 获取常量名称
	 * @param {number} id 常量Id
	 */
	getConst (id) {
		return this.constMap.get(id) || '';
	}

	/**
	 * 判断常量是否存在
	 * @param {number} id 长岭id
	 */
	hasConst (id) {
		return this.constMap.has(id);
 	}
}

const constants = new ConstantUtil();

module.exports = constants;
