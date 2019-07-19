const ServiceResult = require('../core/ServiceResult');
const Pathways = require('../models/Pathways');
const moment = require('moment');
const PathOperates = require('../models/PathOperates');
const Personnels = require('../models/Personnels');
const jwt = require('jsonwebtoken');

const Router = require('koa-router');
const router = new Router();
router.prefix('/api/pathoperates');

/**
* @api {post} /api/pathoperates 创建巡检员巡检记录
* @apiName pathoperates-create
* @apiGroup 巡检员巡检记录(保留)
* @apiDescription 创建巡检员巡检记录
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiParam {String} [gps] 巡检位置gps
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 巡检员巡检记录信息
* @apiSuccess {String} data.pathwayUuid 巡检路线uuid
* @apiSuccess {String} data.gps 巡检位置
* @apiSuccess {String} data.date 巡检日期
* @apiSuccess {Date} data.startTime 巡检开始时间
* @apiSuccess {Boolean} data.accomplished 当前巡检路线是否已经巡检所有项
* @apiSuccess {String} data.userId 巡检员userId
* @apiSuccess {String} data.userName 巡检员姓名
* @apiSuccess {Object} data.personnel 巡检员信息
* @apiSuccess {Object} data.pathway 巡检路线信息
* @apiSuccess {Number} data.category 巡检状态 1-巡检中 2-巡检数据已提交
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let date = moment().format('YYYY-MM-DD');
	const { pathwayUuid, gps } = ctx.request.body;
	if (!user || !user.userId || !pathwayUuid) {
		ctx.body = ServiceResult.getFail('参数错误');
		next();
	}

	return Personnels.findOne({ where: { userId: user.userId, role: 1 } })
		.then(personnel => {
			if (!personnel) {
				return Promise.reject('参数错误');
			}

			return Pathways.findOne({ where: { uuid: pathwayUuid, category: 1 } })
				.then(pathway => {
					if (!pathway) {
						return Promise.reject('参数错误');
					}

					return PathOperates.findOne({ where: { pathwayUuid, category: 1, date } })
						.then(pathoperate => {
							if (pathoperate) {
								return Promise.reject('巡检员存在未提交的当日巡检记录');
							}
							return PathOperates.create({
								pathwayUuid,
								gps,
								date,
								startTime: new Date(),
								accomplished: false,
								userId: user.userId,
								userName: user.userName,
								category: 1,
								pathwayId: pathway.id,
								personnelId: personnel.id
							});
						});
				});
		}).then((pathoperate) => {
			return PathOperates.findOne({
				where: { id: pathoperate.id },
				include: [
					{ model: Personnels, as: 'personnel' },
					{ model: Pathways, as: 'pathway' }
				]
			});
		}).catch(error => {
			console.error('创建巡检记录失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/pathoperates/today?pathwayUuid=&category= 当日巡检员巡检记录
* @apiName pathoperates-today
* @apiGroup 巡检员巡检记录(保留)
* @apiDescription 查询当日巡检员是否存在没有提交的巡检记录
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} pathwayUuid pathway uuid 巡检路线uuid
* @apiParam {Number} [category] 1-巡检中巡检记录 2-已提交的巡检记录，不提供该字段，查询所有的记录
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 巡检员巡检记录信息
* @apiSuccess {String} data.pathwayUuid 巡检路线uuid
* @apiSuccess {String} data.gps 巡检位置
* @apiSuccess {String} data.date 巡检日期
* @apiSuccess {Date} data.startTime 巡检开始时间
* @apiSuccess {Boolean} data.accomplished 当前巡检路线是否已经巡检所有项
* @apiSuccess {String} data.userId 巡检员userId
* @apiSuccess {String} data.userName 巡检员姓名
* @apiSuccess {Object} data.personnel 巡检员信息
* @apiSuccess {Object} data.pathway 巡检路线信息
* @apiSuccess {Number} data.category 巡检状态 1-巡检中 2-巡检数据已提交
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/today', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	let date = moment().format('YYYY-MM-DD');
	const { pathwayUuid, category } = ctx.query;
	if (!user || !user.userId || !pathwayUuid) {
		ctx.body = ServiceResult.getFail('参数错误');
		next();
	}

	return Personnels.findOne({ where: { userId: user.userId, role: 1 } })
		.then(personnel => {
			if (!personnel) {
				return Promise.reject('参数错误');
			}

			return Pathways.findOne({ where: { uuid: pathwayUuid, category: 1 } })
				.then(pathway => {
					if (!pathway) {
						return Promise.reject('参数错误');
					}

					let where = { pathwayUuid, date, userId: user.id };
					if (category) where.category = Number(category);
					return PathOperates.findAll({
						where,
						include: [
							{ model: Personnels, as: 'personnel' },
							{
								model: Pathways,
								as: 'pathway'
							}
						]
					});
				});
		}).catch(error => {
			console.error('创建巡检记录失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

module.exports = router;
