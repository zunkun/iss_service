const ServiceResult = require('../core/ServiceResult');
const Locations = require('../models/Locations');
const Personnels = require('../models/Personnels');
const DingStaffs = require('../models/DingStaffs');

const { Op } = require('sequelize');
const Router = require('koa-router');

const router = new Router();
router.prefix('/api/personnels');

/**
* @api {get} /api/personnels?locationId=&role=&name= 项目点人员信息
* @apiName personals-query
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
* @apiSuccess {Number} data.locationId location id
* @apiSuccess {String} data.userId 人员userId
* @apiSuccess {Object} data.userName 人员姓名
* @apiSuccess {String} data.role 角色 1-执行者operator 2-sv 3-manager
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	// 通过loction中uuid 对用 Personnels 中 locationUuid
	// category=1 标识为当前使用中的人员
	let locationId = ctx.params.locationId;
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

	let location = await Locations.findOne({ where: { id: locationId } });
	if (!location) {
		ctx.body = ServiceResult.getSuccess('参数错误');
		return;
	}
	where.locationUuid = location.uuid;

	let personals = await Personnels.findAll({
		where,
		attributes: [ 'id', 'userId', 'userName', 'role', 'locationId' ]
	});
	ctx.body = ServiceResult.getSuccess(personals);
	await next();
});

/**
* @api {post} /api/personnels 创建项目点人员
* @apiName location-create
* @apiGroup 项目点人员
* @apiDescription 创建项目点人员
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
		return DingStaffs.findOne({ where: { userId: { [Op.in]: userIds } } })
			.then(dingstaffs => {
				let promiseArray = [];
				for (let dingstaff of dingstaffs) {
					let promise = Personnels.findOne({
						where: {
							locationId,
							userId: dingstaff.userId,
							role,
							category: 1
						}
					}).then(personnel => {
						if (personnel) {
							return Promise.resolve(personnel);
						}
						return Personnels.create({
							locationId,
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
		ctx.body = ServiceResult.getFail(error);
		next();
	});
});

/**
* @api {delete} /api/personnels 删除项目点人员
* @apiName location-delete
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
	const { locationId, userId, role } = ctx.request.body;
	return Personnels.findOne({ where: { locationId, userId, role, category: 1 } })
		.then(personnel => {
			if (!personnel) {
				return Promise.reject('参数错误');
			}
			return Personnels.update({ category: 2 }, { where: { locationId, userId, role, category: 1 } });
		}).then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

module.exports = router;
