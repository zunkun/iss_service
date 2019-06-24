const DingDepts = require('../models/DingDepts');
const DingStaffs = require('../models/DingStaffs');
const DeptStaffs = require('../models/DeptStaffs');
const Syncs = require('../models/Syncs');

const dingding = require('../core/dingding');
const config = require('../config');
const cron = require('node-cron');
const moment = require('moment');
const util = require('../core/util');

class StructureSchedule {
	constructor () {
		this.date = moment().format('YYYY-MM-DD');
		this.deptMap = new Map();
		this.departments = [];
		this.dingdeptIdMap = new Map();
	}

	async start () {
		setTimeout(async () => {
			await this.sync();
		}, 2000);
		const task = cron.schedule(config.deptCron, async () => {
			this.date = moment().format('YYYY-MM-DD');
			await this.sync();
		});
		task.start();
	}

	async sync () {
		let sync = await Syncs.findOne({ where: { date: this.date, status: 1 } });
		if (sync) {
			console.log('当日已经同步部门人员信息，不再同步');
			return;
		}

		try {
			await this.syncDepts();
			await this.syncStaffs();

			await Syncs.upsert({ date: this.date, status: 1 }, { where: { date: this.date } });
		} catch (error) {
			console.log({ error });
			await Syncs.upsert({ date: this.date, status: 2 }, { where: { date: this.date } });
		}
	}

	async syncDepts () {
		console.log('【开始】获取部门列表');
		this.departments = await dingding.getDeptLists({ fetch_child: true });

		if (!this.departments.length) {
			return Promise.reject('【失败】没有获取到部门列表');
		}

		this.deptMap.set(1, {
			deptName: config.corpName,
			parentId: 1
		});

		for (let department of this.departments) {
			this.deptMap.set(department.id, {
				deptName: department.name,
				parentId: department.parentid
			});
		}

		console.log('【开始】保存部门列表');
		for (let department of this.departments) {
			let dingdept = await DingDepts.upsert({
				deptId: department.id,
				deptName: department.name,
				parentId: department.parentid
			}, {
				where: {
					deptId: department.id
				},
				returning: true
			});
			this.dingdeptIdMap.set(department.id, dingdept[0].id);
		}
		console.log('【成功】保存部门列表');
		return Promise.resolve();
	}

	async syncStaffs () {
		let promiseArray = [];
		for (let department of this.departments) {
			let promise = this.syncDeptStaffs(department.id);
			await util.wait(200);
			promiseArray.push(promise);
		}
		return Promise.all(promiseArray);
	}

	async syncDeptStaffs (deptId) {
		console.log(`【开始】获取部门 ${deptId} ${this.deptMap.get(deptId).deptName} 人员列表`);
		if (!deptId) return Promise.resolve();

		let userLists = await dingding.getDeptUsers(deptId);

		console.log(`【开始】保存部门 ${deptId} ${this.deptMap.get(deptId).deptName} 人员列表`);
		try {
			for (let user of userLists) {
				let departmentIds = user.department || [];
				let depts = [];
				for (let deptId of departmentIds) {
					depts.push({
						deptId,
						deptName: this.deptMap.get(deptId).deptName || ''
					});
				}

				let staffData = {
					userId: user.userid,
					userName: user.name,
					depts,
					mobile: user.mobile,
					isAdmin: user.isAdmin,
					isBoss: user.isBoss,
					position: user.position,
					email: user.email,
					avatar: user.avatar,
					jobnumber: user.jobnumber
				};

				let dingstaff = await DingStaffs.upsert(staffData, { where: { userId: user.userid }, returning: true });
				await DeptStaffs.upsert({
					userId: user.userid,
					deptId,
					userName: user.name,
					deptName: this.deptMap.get(deptId).deptName || '',
					dingdeptId: this.dingdeptIdMap.get(deptId),
					dingstaffId: dingstaff[0].id
				}, { where: { deptId, userId: user.userid } });
			}
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

const structureSchedule = new StructureSchedule();

module.exports = structureSchedule.start();
