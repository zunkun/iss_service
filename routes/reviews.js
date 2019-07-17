
const ServiceResult = require('../core/ServiceResult');
const Locations = require('../models/Locations');

const Reviews = require('../models/Reviews');
const moment = require('moment');
const Companies = require('../models/Companies');

const { Op } = require('sequelize');
const Router = require('koa-router');

const reviewService = require('../services/reviews');

const router = new Router();
router.prefix('/api/reviews');

/**
* @api {post} /api/reviews/commit SV项目点提交
* @apiName reviews-commit
* @apiGroup 数据审计审核
* @apiDescription SV项目点提交
* @apiPermission SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} locationId 项目点id
* @apiSuccess {Object} data {}
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/commit', async (ctx, next) => {
	const { locationId } = ctx.request.body;
	return Locations.findOne({ where: { id: locationId || null } }).then(location => {
		if (!locationId || !location) {
			return Promise.reject('参数错误');
		}
		return Reviews.findOne({ where: { locationUuid: location.uuid, status: 0 } }).then(review => {
			if (review) {
				return Promise.reject('系统存在正在审核的该项目点提交');
			}
			return reviewService.commit(locationId);
		}).then(review => {
			ctx.body = ServiceResult.getSuccess(review);
			next();
		}).catch(error => {
			ctx.body = ServiceResult.getFail(error);
			next();
		});
	});
});

/**
* @api {post} /api/reviews/status 项目审计单操作
* @apiName reviews-status
* @apiGroup 数据审计审核
* @apiDescription 项目审计单操作
* @apiPermission SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} reviewId 审批单id
* @apiParam {Number} status 1-审批通过 2-审批拒绝
* @apiSuccess {Object} data {}
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/status', async (ctx, next) => {
	const { reviewId, status } = ctx.request.body;

	if ([ 1, 2 ].indexOf(status) === -1) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	return Reviews.findOne({ where: { id: reviewId } }).then(async review => {
		if (review.status !== 0) {
			return Promise.reject('当前审批单已经被审批');
		}
		// 审批同意，操作审批中数据
		if (status === 1) {
			await reviewService.agree(review.locationId, review.locationUuid);
		}
		return Reviews.update({ status }, { where: { id: reviewId } });
	}).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		ctx.body = ServiceResult.getFail(error);
		next();
	});
});

/**
* @api {get} /api/reviews/:Id 项目审计单
* @apiName reviews-info
* @apiGroup 数据审计审核
* @apiDescription 项目审计单
* @apiPermission SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} reviewId 审批单id
* @apiParam {Number} status 1-审批通过 2-审批拒绝
* @apiSuccess {Object} data {}
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Reviews.findOne({
		where: {
			id: ctx.params.id
		},
		include: [
			{ model: Companies, as: 'company', paranoid: false },
			{ model: Locations, as: 'location', paranoid: false }
		]
	}).then((review) => {
		ctx.body = ServiceResult.getSuccess(review);
		next();
	}).catch(error => {
		console.error('获取审批单信息失败', error);
		ctx.body = ServiceResult.getFail(error);
		next();
	});
});

/**
* @api {get} /api/reviews?page=&limit=&companyName=&locationName=&svName=&status=&from=&to= SV项目点提交的项目点审批列表
* @apiName reviews-lists
* @apiGroup 数据审计审核
* @apiDescription SV项目点提交的项目点审批列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [page] 页码,默认值为1
* @apiParam {Number} [limit] 分页条数，默认值为10
* @apiParam {String} [companyName] 客户名称
* @apiParam {String} [locationName] 项目点名称
* @apiParam {String} [svName] 负责人名称
* @apiParam {Number} [status] 审核结果状态 0-待审核 1-审核通过 2-驳回
* @apiParam {String} [from] 开始日期,格式 YYYY-MM-DD
* @apiParam {String} [to] 截止日期,格式 YYYY-MM-DD
* @apiSuccess {Object[]} data sv提交的审批单列表
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, companyName, locationName, svName, status, from, to } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10; ;
	let offset = (page - 1) * limit;
	const where = { };

	if (companyName) {
		where.companyName = { [Op.iLike]: `%${companyName}%` };
	}
	if (locationName) {
		where.name = { [Op.iLike]: `%${locationName}%` };
	}
	if (svName) {
		where.svs = { [Op.contains]: { userName: { [Op.iLike]: `%${svName}%` } } };
	}
	if ([ 0, 1, 2 ].indexOf(status) > -1) {
		where.status = status;
	}
	if (from) {
		if (!where[Op.and]) where[Op.and] = [];
		where[Op.and].push({ createdAt: { [Op.gte]: moment(`${from} 00:00:00`) } });
	}

	if (to) {
		if (!where[Op.and]) where[Op.and] = [];
		where[Op.and].push({ createdAt: { [Op.lte]: moment(`${to} 00:00:00`) } });
	}

	return Reviews.findAndCountAll({
		where,
		limit,
		offset,
		include: [
			{ model: Companies, as: 'company', paranoid: false },
			{ model: Locations, as: 'location', paranoid: false }
		],
		order: [ [ 'createdAt', 'DESC' ] ]
	}).then(reviews => {
		ctx.body = ServiceResult.getSuccess(reviews);
		next();
	}).catch(error => {
		console.error(error);
		ctx.body = ServiceResult.getFail('获取审批表失败');
		next();
	});
});

module.exports = router;
