const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();

const constants = require('../config/constants');
const areaLists = require('../config/areaLists');

router.prefix('/api/constants');

/**
* @api {get} /api/constants 常量信息
* @apiName constants-query
* @apiGroup 常量
* @apiDescription 常量信息
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 常量信息
* @apiSuccess {Object} data.industryMap 客户行业类型
* @apiSuccess {Object} data.roleMap 角色Map
* @apiSuccess {Object} data.systemMap 设备系统
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	ctx.body = ServiceResult.getSuccess(constants);
	await next();
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
