var crypto = require('crypto');
const Equipments = require('../../models/Equipments');
const Inspections = require('../../models/Inspections');
const pinyin = require('pinyin');

const util = {
	/**
	 * 程序等待
	 * @param {number} mileseconds 毫秒
	 */
	async wait (mileseconds) {
		console.log('等待中...');
		return new Promise((resolve, reject) => {
			return setTimeout(() => {
				resolve();
			}, mileseconds || 200);
		});
	},

	/**
	 * 字符串hash
	 * @param {String} string 待hash的字符串
	 */
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

	/**
	 * 获取设备检查项
	 * @param {number} id 设备id
	 */
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
	},

	/**
	 * 复制数据
	 * @param {Array} keys 待复制的key
	 * @param {Object} source 复制来源
	 * @param {Object} target 复制到对象
	 */
	setProperty (keys, source, target) {
		if (!Array.isArray(keys) || !source || !target) {
			throw new Error('设置对象参数列表错误');
		}

		keys.map(key => {
			if (key) target[key] = source[key];
		});
	},

	/**
	 * 将字符串转成拼音格式，比如京东 jingdong
	 *@param {String} characters 需要获取拼音的字符
	 */
	getPinyin (characters) {
		let str = '';
		characters = characters.trim();
		pinyin(characters, { style: pinyin.STYLE_NORMAL }).map(charaterArray => {
			str += charaterArray[0];
		});
		return str;
	}
};

module.exports = util;
