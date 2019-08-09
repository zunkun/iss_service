const Constants = require('../models/Constants');
const constUtil = require('../core/util/constants');

class InitService {
	/**
   * 初始化操作
   */
	init () {
		setTimeout(async () => {
			// 初始化常量表
			await this.initConstants();
		}, 3000);
	}

	async initConstants () {
		console.log('初始化常量表');
		let constants = await Constants.findAll({});

		for (let constant of constants) {
			constUtil.setMap(constant.id, constant.name);
		}
	}
}

const initService = new InitService();

module.exports = initService.init();
