
const ServiceResult = require('../core/ServiceResult');
const Projects = require('../models/Projects');
const Reviews = require('../models/Reviews');
const moment = require('moment');

const { Op } = require('sequelize');
const Router = require('koa-router');

const projectService = require('../services/projects');

const router = new Router();
router.prefix('/api/reviews');

/**
* @api {post} /api/projects/:id/commit SV项目提交
* @apiName reviews-commit
* @apiGroup 数据审计审核
* @apiDescription SV项目提交
* @apiPermission SV
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} projectId 项目id
* @apiSuccess {Object} data {}
* @apiSuccess {Number} errcode 成功为0
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/commit', async (ctx, next) => {
	const { projectId } = ctx.request.body;
	let project = await Projects.findOne({ where: { id: projectId }, raw: true });
	if (!projectId || !project) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	let review = await Reviews.findOne({ where: { projecthistoryId: projectId, status: 0 } });
	if (review) {
		ctx.body = ServiceResult.getFail('系统存在正在审核的该项目提交');
		return;
	}
	try {
		await projectService.commit(projectId);
		ctx.body = ServiceResult.getSuccess({});
	} catch (error) {
		ctx.body = ServiceResult.getFail(error);
	}
	await next();
});

/**
* @api {get} /api/reviews?page=&limit=&customerName=&projectName=&svName=&status=&from=&to= SV项目提交的项目审批列表
* @apiName reviews-lists
* @apiGroup 数据审计审核
* @apiDescription SV项目提交的项目审批列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [page] 页码,默认值为1
* @apiParam {Number} [limit] 分页条数，默认值为10
* @apiParam {String} [customerName] 客户名称
* @apiParam {String} [projectName] 项目名称
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
	let { page, limit, customerName, projectName, svName, status, from, to } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10; ;
	let offset = (page - 1) * limit;
	const where = { [Op.and]: [] };

	if (customerName) {
		where.customerName = { [Op.iLike]: `%${customerName}%` };
	}
	if (projectName) {
		where.name = { [Op.iLike]: `%${projectName}%` };
	}
	if (svName) {
		where.svs = { [Op.contains]: { userName: { [Op.iLike]: `%${svName}%` } } };
	}
	if ([ 0, 1, 2 ].indexOf(status) > -1) {
		where.status = status;
	}
	if (from) {
		where[Op.and].push({ createdAt: { [Op.gte]: moment(`${from} 00:00:00`) } });
	}

	if (to) {
		where[Op.and].push({ createdAt: { [Op.lte]: moment(`${to} 00:00:00`) } });
	}

	let res = await Reviews.findAndCountAll({ where, limit, offset, raw: true });
	ctx.body = ServiceResult.getSuccess(res);
	await next();
});

module.exports = router;
