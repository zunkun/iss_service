const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const DingStaffs = require('../models/DingStaffs');
const Handovers = require('../models/Handovers');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { Op } = require('sequelize');

router.prefix('/api/handovers');

/**
* @api {get} /api/handovers?limit=&page=&userId=&fromto=&keywords=&fromDate=&toDate= 交班列表
* @apiName handover-lists
* @apiGroup 交班
* @apiDescription 交班列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页每页条数，默认10条数据
* @apiParam {Number} [page] 分页查询的页码
* @apiParam {String} [userId] 员工userId，配合fromto参数使用
* @apiParam {Number} [fromto] 1-查询发起人(userId)的交班记录 2-查询接收人(userId)的交班记录
* @apiParam {String} [keywords] 关键字查询
* @apiParam {Date} [fromDate] 开始时间 2019-02-01
* @apiParam {Date} [toDate] 结束时间 2019-02-01
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 交班handover列表
* @apiSuccess {Number} data.count 交班handover总共条数
* @apiSuccess {Object[]} data.rows 交班handover当前页列表
* @apiSuccess {Number} data.rows.id 交班id
* @apiSuccess {String} data.rows.fromUserId 发起人userId
* @apiSuccess {String} data.rows.fromStaff 发起人信息
* @apiSuccess {String} data.rows.fromUserId 发起人userId
* @apiSuccess {String} data.rows.fromGps 发起人Gps
* @apiSuccess {String[]} data.rows.fromImages 发起人填写备注信息
* @apiSuccess {String} data.rows.toUserId 接收人钉钉userId
* @apiSuccess {Object} data.rows.toStaff 接收人信息
* @apiSuccess {Object} data.rows.toGps 接收人Gps
* @apiSuccess {Object} data.rows.toImagers 接收人上传图片
* @apiSuccess {Object} data.rows.toRemark 接收人备注
* @apiSuccess {Number} data.rows.category 工作交接状态 1-交接中 2-交接成功 3-撤回 4-拒绝
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords, fromto, userId, fromDate, toDate } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;

	const where = { [Op.or]: [] };
	if (keywords) {
		where[Op.or].push({
			fromUserName: {
				[Op.iLike]: `%${keywords}%`
			}
		});

		where[Op.or].push({
			toUserName: {
				[Op.iLike]: `%${keywords}%`
			}
		});
	}

	if (userId) {
		if (fromto === 1) {
			where.fromUserId = userId;
		} else if (fromto === 2) {
			where.toUserId = userId;
		} else {
			where[Op.or].push({ fromUserId: userId });
			where[Op.or].push({ toUserId: userId });
		}
	}

	if (fromDate) {
		fromDate = moment(fromDate).format('YYYY-MM-DD');
		if (!where.date) {
			where.date = {};
		}
		where.date[Op.gte] = fromDate;
	}

	if (toDate) {
		toDate = moment(toDate).format('YYYY-MM-DD');
		if (!where.date) {
			where.date = {};
		}
		where.date[Op.lte] = toDate;
	}

	return Handovers.findAndCountAll({ where, limit, offset }).then(handovers => {
		ctx.body = ServiceResult.getSuccess(handovers);
		next();
	}).catch(error => {
		console.log(error);
		ctx.body = ServiceResult.getFail('获取交班数据失败');
		next();
	});
});

/**
* @api {post} /api/handovers 发起交班
* @apiName handover-create
* @apiGroup 交班
* @apiDescription 发起交班
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} [fromGps] 发起人GPS定位地址
* @apiParam {String[]} [fromImages] 发起人上传图片uri数组
* @apiParam {String} [fromRemark] 发起人填写备注信息
* @apiParam {String} toUserId 接收人userId
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 交班handover数据
* @apiSuccess {Number} data.id 交班id
* @apiSuccess {String} data.fromUserId 发起人userId
* @apiSuccess {String} data.fromUserName 发起人姓名
* @apiSuccess {String} data.fromGps 发起人Gps
* @apiSuccess {String[]} data.fromImages 发起人填写备注信息
* @apiSuccess {String} data.toUserId 接收人钉钉userId
* @apiSuccess {String} data.toUserName 接收人姓名
* @apiSuccess {Date} data.date 交班日期
* @apiSuccess {Number} data.category 工作交接状态 1-交接中 2-交接成功 3-撤回 4-拒绝
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;
	if (!data.toUserId) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	return DingStaffs.findOne({ where: { userId: user.userId } })
		.then(fromUser => {
			if (!fromUser) {
				return Promise.reject('参数错误');
			}
			return DingStaffs.findOne({ where: { userId: data.toUserId } })
				.then(toUser => {
					if (!toUser) {
						return Promise.reject('参数错误');
					}
					return { fromUser, toUser };
				});
		})
		.then(userInfo => {
			let handoverData = {
				fromUserId: user.userId,
				fromUserName: userInfo.fromUser.userName,
				fromStaffId: userInfo.fromUser.id,
				toUserId: data.toUserId,
				toUserName: userInfo.toUser.userName,
				toStaffId: userInfo.toUser.id,
				fromGps: data.fromGps,
				fromImages: data.fromImages,
				fromRemark: data.fromRemark,
				startTime: new Date(),
				date: moment().format('YYYY-MM-DD'),
				category: 1
			};
			return Handovers.create(handoverData)
				.then((handover) => {
					ctx.body = ServiceResult.getSuccess({
						id: handover.id,
						fromUserId: user.userId,
						fromUserName: userInfo.fromUser.userName,
						toUserId: data.toUserId,
						toUserName: userInfo.toUser.userName,
						fromGps: data.fromGps,
						fromImages: data.fromImages,
						fromRemark: data.fromRemark,
						date: handover.date,
						category: 1
					});
					next();
				});
		}).catch(error => {
			console.log('发起工作交接失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/handovers/:id 交班信息
* @apiName handover-info
* @apiGroup 交班
* @apiDescription 交班信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 交班信息id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 交班handover数据
* @apiSuccess {Number} data.id 交班id
* @apiSuccess {String} data.fromUserId 发起人userId
* @apiSuccess {String} data.fromUserName 发起人姓名
* @apiSuccess {String} data.fromUserId 发起人userId
* @apiSuccess {String} data.fromGps 发起人Gps
* @apiSuccess {String[]} data.fromImages 发起人填写备注信息
* @apiSuccess {String} data.toUserId 接收人钉钉userId
* @apiSuccess {String} data.toUserName 接收人姓名
* @apiSuccess {String} data.toGps 接收人Gps
* @apiSuccess {String[]} data.toImages 接收人上传图片
* @apiSuccess {String} data.toRemark 接收人备注
* @apiSuccess {Date} data.date 交班日期
* @apiSuccess {Number} data.category 工作交接状态 1-交接中 2-交接成功 3-撤回 4-拒绝
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Handovers.findOne({
		where: { id: ctx.params.id }
	}).then(handover => {
		ctx.body = ServiceResult.getSuccess(handover);
		next();
	}).catch(error => {
		console.log(error);
		ctx.body = ServiceResult.getFail('获取交班数据失败');
		next();
	});
});

/**
* @api {post} /api/handovers/:id/revoke 撤销交班
* @apiName handover-revoke
* @apiGroup 交班
* @apiDescription 撤销交班
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 交班信息id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/revoke', (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));

	return Handovers.findOne({ where: { id: ctx.params.id } })
		.then(handover => {
			if (!handover) {
				return Promise.reject('没有权限');
			}
			if (handover.fromUserId !== user.userId) {
				return Promise.reject('没有权限');
			}
			if (handover.category !== 1) {
				return Promise.reject('当前交班已经被接收人处理，无法操作');
			}
			return Handovers.update({
				category: 3
			}, {
				where: { id: ctx.params.id }
			});
		})
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.log(error);
			ctx.body = ServiceResult.getFail('撤销交班数据失败');
			next();
		}); ;
});

/**
* @api {post} /api/handovers/:id/receiver 接收人处理交班数据
* @apiName handover-reveiver
* @apiGroup 交班
* @apiDescription 接收人处理交班数据
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 交班信息id
* @apiParam {Number} category 2-接受交接 4-拒绝交接
* @apiParam {String} [toRemark] 接收人备注
* @apiParam {String} [toGps] 接收人Gps
* @apiParam {String[]} [toImages] 接收人上传图片uri列表
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/receiver', (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let data = ctx.request.body;
	let category = data.category;
	if (category !== 2 && category !== 4) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	return Handovers.findOne({ where: { id: ctx.params.id } })
		.then(handover => {
			if (!handover) {
				return Promise.reject('没有权限');
			}
			if (handover.toUserId !== user.userId) {
				return Promise.reject('没有权限');
			}
			if (handover.category !== 1) {
				return Promise.reject('当前交班已经被接收人处理，无法操作');
			}
			let updateData = { category, endTime: new Date() };
			[ 'toRemark', 'toGps', 'toImages' ].map(key => {
				if (data[key]) updateData[key] = data[key];
			});

			return Handovers.update(updateData, {
				where: { id: ctx.params.id }
			});
		})
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.log(error);
			ctx.body = ServiceResult.getFail(error);
			next();
		}); ;
});

module.exports = router;
