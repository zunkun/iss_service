
const rp = require('request-promise');
const config = require('../../config');
const util = require('../util');
class Dingding {
	constructor () {
		this.token = {};
	}

	/**
	 * 获取access_token
	 */
	async getAccessToken () {
		if (!this.token.expires || this.token.expires < Date.now() + 20 * 60 * 1000) {
			let data = await rp.get(`${config.dingBaseUri}/gettoken?appkey=${config.appkey}&appsecret=${config.appsecret}`, { json: true });
			if (!data || data.errcode !== 0) {
				throw data;
			}
			this.token = {
				access_token: data.access_token,
				expires: Date.now() + 7200 * 1000
			};
			return data.access_token;
		} else {
			return this.token.access_token;
		}
	}

	/**
	 * 获取子部门列表
	 * @param {Number} id 根部门id
	 * @param {Boolean} fetch_child 是否遍历所有子部门
	 */
	async getDeptLists (options = { id: 1, fetch_child: false }) {
		let uri = `${config.dingBaseUri}/department/list`;
		let data = await rp.get(uri, {
			qs: {
				id: options.id || 1,
				fetch_child: options.fetch_child,
				access_token: await this.getAccessToken()
			},
			json: true
		});
		console.log({ data });
		if (data.errcode === 0) {
			return data.department;
		} else {
			return [];
		}
	}

	async getDeptInfo (deptId) {
		let uri = `${config.dingBaseUri}/department/get`;
		let data = await rp.get(uri, {
			qs: {
				id: deptId || 1,
				access_token: await this.getAccessToken()
			},
			json: true
		});
		return data;
	}

	/**
	 *获取部门人员列表
	 * @param {Number} deptId 部门id
	 */
	async getDeptUsers (deptId) {
		// https://oapi.dingtalk.com/user/simplelist?access_token=ACCESS_TOKEN&department_id=1
		let accessToken = await this.getAccessToken();
		let uri = `${config.dingBaseUri}/user/listbypage`;
		let options = {
			uri,
			method: 'GET',
			qs: {
				access_token: accessToken,
				department_id: deptId,
				size: 100
			},
			json: true
		};
		let userLists = await this.getUserLists([], options);
		return userLists;
	}

	async getUserLists (userLists = [], options, offset = 0) {
		options.qs.offset = offset;
		offset += 1;
		let data = await rp(options);

		if (data.errcode === 0) {
			userLists = userLists.concat(data.userlist || []);
			if (!data.hasMore) {
				return userLists;
			}
			await util.wait(200);
			return this.getUserLists(userLists, options, offset);
		} else {
			return userLists;
		}
	}

	async getUser (userId) {
		// https://oapi.dingtalk.com/user/get?access_token=ACCESS_TOKEN&userid=zhangsan
		let accessToken = await this.getAccessToken();
		let url = `${config.dingBaseUri}/user/get?access_token=${accessToken}&userid=${userId}`;
		let data = await rp.get(url, { json: true });
		return data;
	}

	async getuserinfo (code) {
		let accessToken = await this.getAccessToken();
		let url = `${config.dingBaseUri}/user/getuserinfo?access_token=${accessToken}&code=${code}`;
		let data = await rp.get(url, { json: true });
		return data;
	}

	async sendMsg (OA) {
		// https://oapi.dingtalk.com/message/send?access_token=ACCESS_TOKEN
		let accessToken = await this.getAccessToken();
		let json = await rp.post(`https://oapi.dingtalk.com/message/send?access_token=${accessToken}`, {
			body: OA, json: true
		});
		if (json.errcode === 0) {
			return json;
		} else {
			console.error('发送失败', json.errmsg);
			throw json.errmsg;
		}
	}

	async getCorpRoles () {
		let accessToken = await this.getAccessToken();
		let uri = `${config.dingBaseUri}/topapi/role/list`;
		let options = {
			uri,
			method: 'POST',
			qs: {
				access_token: accessToken
			},
			body: {
				size: 200
			},
			json: true
		};
		let roleLists = await this.getRoleLists([], options);
		return roleLists;
	}

	async getRoleLists (roleLists = [], options, offset = 0) {
		options.body.offset = offset;
		offset += 200;
		let data = await rp(options);

		if (data.errcode === 0) {
			let result = data.result || {};
			roleLists = roleLists.concat(result.list || []);
			if (!result.hasMore) {
				return roleLists;
			}
			await util.wait(200);
			return this.getRoleLists(roleLists, options, offset);
		} else {
			return roleLists;
		}
	}

	async getCorpRoleUsers (roleId) {
		let accessToken = await this.getAccessToken();
		let uri = `${config.dingBaseUri}/topapi/role/simplelist`;
		let options = {
			uri,
			method: 'POST',
			qs: {
				access_token: accessToken
			},
			body: {
				role_id: roleId,
				size: 200
			},
			json: true
		};
		let userLists = await this.getRoleUserLists([], options);
		return userLists;
	}

	async getRoleUserLists (userLists = [], options, offset = 0) {
		options.body.offset = offset;
		offset += 200;
		let data = await rp(options);

		if (data.errcode === 0) {
			let result = data.result || {};
			userLists = userLists.concat(result.list || []);
			if (!result.hasMore) {
				return userLists;
			}
			await util.wait(200);
			return this.getRoleLists(userLists, options, offset);
		} else {
			return userLists;
		}
	}
}

const dingding = new Dingding();

module.exports = dingding;
