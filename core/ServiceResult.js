class ServiceResult {
	/**
   * @constructor
   * @param {*} data
   */
	constructor (data) {
		this.errcode = 0;
		this.success = true;
		this.errmsg = '';
		this.data = data;
	}

	/**
   * 成功
   * @param {*} data
   * @return {ServiceResult}
   */
	static getSuccess (data) { // 成功消息
		return new ServiceResult(data);
	}

	/**
   * 失败
   * @param {number} errcode
   * @param {string} errmsg
   * @param {*} data
   * @returns {ServiceResult}
   */
	static getFail (errmsg, data, errcode = -1) { // 错误消息
		let rt = new ServiceResult(data);
		rt.success = false;
		rt.errcode = errcode;
		rt.errmsg = errmsg;
		return rt;
	}
}

module.exports = ServiceResult;
