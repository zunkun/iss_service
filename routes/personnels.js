const ServiceResult = require('../core/ServiceResult');
const Locations = require('../models/Locations');
const Personnels = require('../models/Personnels');
const DingStaffs = require('../models/DingStaffs');
const Companies = require('../models/Companies');
const jwt = require('jsonwebtoken');

const { Op } = require('sequelize');
const Router = require('koa-router');

const router = new Router();
router.prefix('/api/personnels');

/**
* @api {get} /api/personnels?locationId=&role=&name= 项目点人员信息
* @apiName personnels-query
* @apiGroup 项目人员信息
* @apiDescription 项目点人员列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {Number} [role] 角色 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员)
* @apiParam {String} [name] 姓名
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目点人员location列表
* @apiSuccess {Number} data.id 项目组人员id
* @apiSuccess {String} data.userId 人员userId
* @apiSuccess {Object} data.userName 人员姓名
* @apiSuccess {String} data.role 角色 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员)
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	// 通过loction中uuid 对用 Personnels 中 locationUuid
	// status=1 标识为当前使用中的人员
	let locationId = ctx.query.locationId;
	let role = ctx.query.role || [];
	const where = { status: 1 };

	let roleArray = [];
	for (let item of role) {
		roleArray.push(Number(item));
	}
	if (roleArray.length) where.role = { [Op.in]: roleArray };

	if (ctx.query.name) {
		where.userName = { [Op.iLike]: `%${name}%` };
	}

	return Locations.findOne({ where: { id: locationId || null } })
		.then(location => {
			if (!location) {
				ctx.body = ServiceResult.getSuccess('参数错误');
				return;
			}
			where.locationUuid = location.uuid;
			return Personnels.findAll({
				where,
				attributes: [ 'id', 'userId', 'userName', 'role' ],
				raw: true
			}).then((personnels) => {
				ctx.body = ServiceResult.getSuccess(personnels);
				next();
			});
		})
		.catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/personnels/kam 获取客户经理
* @apiName personnels-kam
* @apiGroup 项目人员信息
* @apiDescription 获取客户经理
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} companyId 客户Id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目点人员信息
* @apiSuccess {Number} data.id 项目点人员id
* @apiSuccess {Object} data.userId 人员userId
* @apiSuccess {String} data.userName 人员姓名
* @apiSuccess {Number} data.role 人员角色 当前值为 50 项目点经理
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/

router.get('/kam', (ctx, next) => {
	let companyId = ctx.query.companyId;
	if (!companyId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	return Personnels.findAll({
		include: [ {
			model: DingStaffs,
			as: 'dingstaff'
		} ],
		where: {
			companyId,
			role: 50
		}
	}).then((personnels) => {
		let res = [];
		for (let personnel of personnels) {
			res.push({
				id: personnel.id,
				userId: personnel.userId,
				userName: personnel.userName,
				role: personnel.role,
				avatar: personnel.dingstaff.avatar || ''
			});
		}
		ctx.body = ServiceResult.getSuccess(res);
		next();
	}).catch(error => {
		console.error('获取kam失败', error);
		ctx.body = ServiceResult.getFail('获取客户经理失败');
		next();
	});
});

/**
* @api {post} /api/personnels/kam 设置客户经理
* @apiName personnels-kam
* @apiGroup 项目人员信息
* @apiDescription 设置客户经理
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String[]} userIds 人员userId列表
* @apiParam {Number} companyId 客户Id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目点人员信息
* @apiSuccess {Number} data.id 项目点人员id
* @apiSuccess {Object} data.userId 人员userId
* @apiSuccess {String} data.userName 人员姓名
* @apiSuccess {Number} data.role 人员角色 当前值为 50 项目点经理
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/kam', async (ctx, next) => {
	const { companyId, userIds } = ctx.request.body;

	if (!companyId || !Array.isArray(userIds) || !userIds.length) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	let timestamps = Date.now();

	return Companies.findOne({ where: { id: companyId } })
		.then(company => {
			if (!companyId) {
				return Promise.reject('无法获取客户信息');
			}
			return DingStaffs.findAll({ where: { userId: { [Op.in]: userIds } } }).then(staffs => {
				let personnels = [];
				for (let staff of staffs) {
					personnels.push({
						companyId: company.id,
						companyName: company.name,
						userId: staff.userId,
						userName: staff.userName,
						avatar: staff.avatar,
						role: 50,
						dingstaffId: staff.id,
						timestamps,
						status: 1
					});
				}

				// 创建客户经理信息;
				return Personnels.bulkCreate(personnels)
					.then(() => {
						// 删除旧的客户经理信息
						return Personnels.destroy({
							where: { companyId: company.id, role: 50,	timestamps: { [Op.ne]: timestamps }	}
						});
					});
			});
		}).then(() => {
			// 返回客户经理信息
			return Personnels.findAll({
				attributes: [ 'id', 'userId', 'userName', 'avatar', 'role' ],
				where: { companyId,	role: 50,	timestamps },
				raw: true
			}).then(personnels => {
				ctx.body = ServiceResult.getSuccess(personnels);
				next();
			});
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {post} /api/personnels 设置项目点人员
* @apiName personnels-settings
* @apiGroup 项目人员信息
* @apiDescription 设置项目点人员
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} locationId 项目点id
* @apiParam {String[]} userIds 人员userId列表
* @apiParam {Number} role 人员角色 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员)
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点人员信息
* @apiSuccess {Number} data.id 项目点人员id
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Object} data.userId 人员userId
* @apiSuccess {String} data.userName 人员姓名
* @apiSuccess {Number} data.role 人员角色 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员)
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const { locationId, userIds, role } = ctx.request.body;
	let timestamps = Date.now();
	return Locations.findOne({ where: { id: locationId || null	}	})
		.then((location) => {
			if (!location) {
				return Promise.reject('参数错误');
			}

			return DingStaffs.findAll({ where: { userId: { [Op.in]: userIds } }, raw: true })
				.then(dingstaffs => {
					let promiseArray = [];
					for (let dingstaff of dingstaffs) {
						let promise = Personnels.findOne({
							where: {
								locationUuid: location.uuid,
								userId: dingstaff.userId,
								role,
								status: 1
							}
						}).then(personnel => {
							if (personnel) {
								return Promise.resolve(personnel);
							}
							return Personnels.create({
								locationUuid: location.uuid,
								userId: dingstaff.userId,
								userName: dingstaff.userName,
								avatar: dingstaff.avatar,
								role,
								dingstaffId: dingstaff.id,
								timestamps,
								status: 1
							});
						});
						promiseArray.push(promise);
					}
					return Promise.all(promiseArray);
				});
		}).then(personnels => {
			let res = [];
			for (let personnel of personnels) {
				res.push({
					id: personnel.id,
					userId: personnel.userId,
					userName: personnel.userName,
					role: personnel.role,
					locationId: personnel.locationId
				});
			}
			ctx.body = ServiceResult.getSuccess(res);
			next();
		}).catch(error => {
			console.log({ error });
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/personnels/role?locationId= 用户项目点角色
* @apiName personnels-role
* @apiGroup 项目人员信息
* @apiDescription 获取当前登录用户在项目点中角色
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiSuccess {Object} data 角色数据
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Boolean} data.roles 当前用户的角色列表[10] 10-执行者operator 20-SV 30-SM（项目点经理） 40-DA(数据管理员)
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/role', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const roleSet = new Set();
	if (!ctx.query.locationId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	return Locations.findOne({ where: { id: ctx.query.locationId || null } })
		.then(location => {
			if (!location) {
				return Promise.reject('参数错误');
			}
			return Personnels.findAll({ where: { locationUuid: location.uuid, userId: user.userId } })
				.then(personnels => {
					for (let personnel of (personnels || [])) {
						roleSet.add(personnel.role);
					}
					ctx.body = ServiceResult.getSuccess({ locationId: location.id, roles: Array.from(roleSet) });
					next();
				});
		}).catch((error) => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

module.exports = router;
