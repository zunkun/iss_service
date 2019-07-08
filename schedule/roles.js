const dingding = require('../core/dingding');
const Roles = require('../models/Roles');
const DingStaffs = require('../models/DingStaffs');
const cron = require('node-cron');
const { Op } = require('sequelize');
const config = require('../config');

class RoleSchedule {
	constructor () {
		this.roles = [];
	}

	async start () {
		await this.sync();
		const task = cron.schedule(config.roleCron, async () => {
			await this.sync();
		});
		return task.start();
	}

	async sync () {
		let role = await Roles.findOne({ where: { name: 'OE' } });
		if (!role) {
			await this.getRoleLists();
		}
		await this.setOE();
	}

	async getRoleLists () {
		let roleGroups = await dingding.getCorpRoles();
		this.roles = [];
		for (let group of roleGroups) {
			for (let item of group.roles) {
				console.log(`【保存】角色 ${item.name}`);
				await Roles.upsert({
					roleId: item.id,
					name: item.name,
					groupId: group.id,
					groupName: group.name
				});

				this.roles.push({
					id: item.id,
					name: item.name
				});
			}
			console.log('【成功】保存角色人信息');
		}
	}

	async getRoleUserIds (roleId) {
		let userLists = await dingding.getCorpRoleUsers(roleId);
		let staffIds = [];
		for (let item of userLists) {
			staffIds.push(item.userId);
		}
		return staffIds;
	}

	async setOE () {
		let role = await Roles.findOne({ where: { name: 'OE' } });
		if (!role) {
			return;
		}
		let staffIds = await this.getRoleUserIds(role.roleId);

		console.log('【保存】OE角色');
		await DingStaffs.update({ oe: true }, { where: { userId: { [Op.in]: staffIds } } });
	}
}

let roleSchedule = new RoleSchedule();
module.exports = roleSchedule.start();
