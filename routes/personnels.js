const ServiceResult = require('../core/ServiceResult');
const Locations = require('../models/Locations');
const Personnels = require('../models/Personnels');
const DingStaffs = require('../models/DingStaffs');
const jwt = require('jsonwebtoken');

const { Op } = require('sequelize');
const Router = require('koa-router');

const router = new Router();
router.prefix('/api/personnels');

/**
* @api {get} /api/personnels?locationId=&role=&name= 项目点人员信息
* @apiName personnels-query
* @apiGroup 项目点人员
* @apiDescription 项目点人员列表
* @apiPermission OE/SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiParam {Number[]} [role] 角色 1-执行者operator 2-sv 3-manager，例如 role=1&role=2&role=3 或者 role=[1,2,3]
* @apiParam {String} [name] 姓名
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 项目点人员location列表
* @apiSuccess {Number} data.id 项目组人员id
* @apiSuccess {String} data.userId 人员userId
* @apiSuccess {Object} data.userName 人员姓名
* @apiSuccess {String} data.role 角色 1-执行者operator 2-sv 3-manager
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	// 通过loction中uuid 对用 Personnels 中 locationUuid
	// category=1 标识为当前使用中的人员
	let locationId = ctx.query.locationId;
	let role = ctx.query.role || [];
	let roleArray = [];
	for (let item of role) {
		roleArray.push(Number(item));
	}
	if (!ctx.query.role) {
		roleArray = [ 1, 2, 3 ];
	}
	const where = { role: { [Op.in]: roleArray }, category: 1 };
	if (ctx.query.name) {
		where.userName = { [Op.iLike]: `%${name}%` };
	}

	let location = await Locations.findOne({ where: { id: locationId || null } });
	if (!location) {
		ctx.body = ServiceResult.getSuccess('参数错误');
		return;
	}
	where.locationUuid = location.uuid;

	let personnels = await Personnels.findAll({
		where,
		attributes: [ 'id', 'userId', 'userName', 'role' ],
		raw: true
	});
	ctx.body = ServiceResult.getSuccess(personnels);
	await next();
});

/**
* @api {post} /api/personnels 设置项目点人员
* @apiName personnels-settings
* @apiGroup 项目点人员
* @apiDescription 设置项目点人员
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} locationId 项目点id
* @apiParam {String[]} userIds 人员userId列表
* @apiParam {Number} role 人员角色 1-执行者operator 2-sv 3-manager
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 项目点人员信息
* @apiSuccess {Number} data.id 项目点人员id
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Object} data.userId 人员userId
* @apiSuccess {String} data.userName 人员姓名
* @apiSuccess {Number} data.role 人员角色 1-执行者operator 2-sv 3-manager
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const { locationId, userIds, role } = ctx.request.body;
	return Locations.findOne({
		where: {
			id: locationId || null
		}
	}).then((location) => {
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
							category: 1
						}
					}).then(personnel => {
						if (personnel) {
							return Promise.resolve(personnel);
						}
						return Personnels.create({
							locationUuid: location.uuid,
							userId: dingstaff.userId,
							userName: dingstaff.userName,
							role,
							dingstaffId: dingstaff.id,
							category: 1
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
* @api {delete} /api/personnels 删除项目点人员
* @apiName personnels-delete
* @apiGroup 项目点人员
* @apiDescription 删除项目点人员
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} userId 项目点人员userId
* @apiParam {String} role 项目点人员角色
* @apiParam {Number} locationId 项目点id
* @apiSuccess {Object} data {}
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/', async (ctx, next) => {
	const { userId, role } = ctx.request.body;
	return Locations.findOne({ where: { id: ctx.query.locationId || null } })
		.then(location => {
			if (!location) {
				return Promise.reject('参数错误');
			}
			return Personnels.findOne({ where: { locationUuid: location.uuid, userId, role, category: 1 } })
				.then(personnel => {
					if (!personnel) {
						return Promise.reject('参数错误');
					}
					return Personnels.update({ category: 2 }, { where: { id: personnel.id } });
				}).then(() => {
					ctx.body = ServiceResult.getSuccess({});
					next();
				});
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/personnels/role?locationId= 用户项目点角色
* @apiName personnels-role
* @apiGroup 项目点人员
* @apiDescription 获取当前登录用户在项目点中角色
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiSuccess {Object} data 角色数据
* @apiSuccess {Number} data.locationId 项目点id
* @apiSuccess {Boolean} data.roles 当前用户的角色列表[1, 2, 3] 1-执行者operator 2-sv 3-manager
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
					ctx.body = ServiceResult.getSuccess({ locationId: location.id, role: Array.from(roleSet) });
					next();
				});
		}).catch((error) => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

module.exports = router;
