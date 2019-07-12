const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Constants = require('../models/Constants');
const areaLists = require('../config/areaLists');
const { Op } = require('sequelize');

router.prefix('/api/constants');

/**
* @api {get} /api/constants?classfication=&name= 常量信息
* @apiName constants-query
* @apiGroup 常量
* @apiDescription 常量信息
* @apiParam {String} [classfication] 分类
* @apiParam {String} [name] 分类名称
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 常量信息
* @apiSuccess {Object} data.industryMap 客户行业类型
* @apiSuccess {Object} data.roleMap 角色Map
* @apiSuccess {Object} data.systemMap 设备系统
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	const { classfication, name } = ctx.query;
	const where = {};
	if (classfication) { where.classfication = { [Op.iLike]: `%${classfication}%` }; }
	if (name) { where.name = { [Op.iLike]: `%${name}%` }; }
	return Constants.findAll({
		attributes: [ 'id', 'classfication', 'name' ],
		where,
		raw: true
	}).then(constants => {
		ctx.body = ServiceResult.getSuccess(constants);
		next();
	}).catch(() => {
		ctx.body = ServiceResult.getSuccess([]);
		next();
	});
});

/**
* @api {get} /api/constants/area 地址信息
* @apiName area
* @apiGroup 常量
* @apiDescription 地址信息
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 地址信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/area', async (ctx, next) => {
	ctx.body = ServiceResult.getSuccess(areaLists);
	await next();
});

module.exports = router;
