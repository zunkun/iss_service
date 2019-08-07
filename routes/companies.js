const ServiceResult = require('../core/ServiceResult');
const { Op } = require('sequelize');
const Router = require('koa-router');
const router = new Router();
const Companies = require('../models/Companies');
const areaMap = require('../config/areaMap');
const util = require('../core/util');
const jwt = require('jsonwebtoken');
const CompanyService = require('../services/company');

router.prefix('/api/companies');

/**
* @api {get} /api/companies?limit=&page=&name=&industryId= 客户列表
* @apiName companies-lists
* @apiGroup 客户
* @apiDescription 客户列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [name] 客户名称
* @apiParam {String} [industryId] 行业编码
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户列表
* @apiSuccess {Number} data.count 客户总数
* @apiSuccess {Object[]} data.rows 当前页客户列表
* @apiSuccess {Number} data.rows.id 客户ID
* @apiSuccess {String} data.rows.name 客户名称
* @apiSuccess {String} data.rows.shortname 名称缩写
* @apiSuccess {String} data.rows.costcenter 客户代码（财务编号）
* @apiSuccess {String} data.rows.provinceCode 省份编码
* @apiSuccess {String} data.rows.provinceName 省份名称
* @apiSuccess {String} data.rows.cityCode 城市编码
* @apiSuccess {String} data.rows.cityName 城市名称
* @apiSuccess {String} data.rows.districtCode  区县编码
* @apiSuccess {String} data.rows.districtName  区县名称
* @apiSuccess {String} data.rows.street  地址详细
* @apiSuccess {String} data.rows.email 邮箱
* @apiSuccess {String} data.rows.mainphone 电话总机
* @apiSuccess {String} data.rows.zippostal 邮编
* @apiSuccess {Number} data.rows.industryId  行业类型id
* @apiSuccess {String} data.rows.industryName  行业类型
* @apiSuccess {String} data.rows.createdUserId  创建人usrId
* @apiSuccess {String} data.rows.createdUserName  创建人userName
* @apiSuccess {Number} data.rows.status 当前客户数据状态 0-编辑中 1-启用 2-停用中
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, name, industryId } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	let where = {};

	if (name && name !== 'undefined') {
		where[Op.or] = [
			{ name: { [Op.like]: `%${name}%` } },
			{ pinyin: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${name}%` } },
					{ shortname: { [Op.iLike]: `%${name}%` } }
				] }
			}
		];
	}
	if (industryId) {
		where.industryId = industryId;
	}

	let companies = await Companies.findAndCountAll({
		where,
		limit,
		offset,
		attributes: { exclude: [ 'pinyin', 'updatedAt', 'deletedAt' ] },
		order: [ [ 'createdAt', 'DESC' ] ]
	});
	ctx.body = ServiceResult.getSuccess(companies);
	await next();
});

/**
* @api {post} /api/companies 创建客户
* @apiName company-create
* @apiGroup 客户
* @apiDescription 创建客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} name 客户名称
* @apiParam {String} [shortname] 名称缩写
* @apiParam {String} [costcenter] 客户代码（财务编号）
* @apiParam {Number} [industryId]  行业类型id
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [email] 邮箱
* @apiParam {String} [mainphone] 电话总机
* @apiParam {String} [zippostal] 邮编
* @apiParam {String} [description] 描述
* @apiParam {Number} status 当前客户数据状态 0-编辑中 1-启用 2-停用中，默认为0
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户company
* @apiSuccess {Number} data.id 客户ID
* @apiSuccess {String} data.name 客户名称
* @apiSuccess {String} data.shortname 名称缩写
* @apiSuccess {String} data.costcenter 客户代码（财务编号）
* @apiSuccess {String} data.provinceCode 省份编码
* @apiSuccess {String} data.provinceName 省份名称
* @apiSuccess {String} data.cityCode 城市编码
* @apiSuccess {String} data.cityName 城市名称
* @apiSuccess {String} data.districtCode  区县编码
* @apiSuccess {String} data.districtName  区县名称
* @apiSuccess {String} data.street  地址详细
* @apiSuccess {String} data.email 邮箱
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {String} data.zippostal 邮编
* @apiSuccess {Number} data.industryId  行业类型id
* @apiSuccess {String} data.industryName  行业类型
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前客户数据状态 0-编辑中 1-启用 2-停用中
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const data = ctx.request.body;
	if (!data.name || !user.userId) {
		ctx.body = ServiceResult.getFail('保存失败');
		return;
	}
	return CompanyService.saveCompany(data, user)
		.then(company => {
			company =	company.toJSON();
			// 删除时间戳信息
			delete company.createdAt;
			delete company.pinyin;

			ctx.body = ServiceResult.getSuccess(company);
			next();
		}).catch(error => {
			console.error('创建客户信息失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {get} /api/companies/:id 客户信息
* @apiName companies-info
* @apiGroup 客户
* @apiDescription 客户信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 客户信息
* @apiSuccess {Number} data.id 客户ID
* @apiSuccess {String} data.name 客户名称
* @apiSuccess {String} data.shortname 名称缩写
* @apiSuccess {String} data.costcenter 客户代码（财务编号）
* @apiSuccess {String} data.provinceCode 省份编码
* @apiSuccess {String} data.provinceName 省份名称
* @apiSuccess {String} data.cityCode 城市编码
* @apiSuccess {String} data.cityName 城市名称
* @apiSuccess {String} data.districtCode  区县编码
* @apiSuccess {String} data.districtName  区县名称
* @apiSuccess {String} data.street  地址详细
* @apiSuccess {String} data.email 邮箱
* @apiSuccess {String} data.mainphone 电话总机
* @apiSuccess {String} data.zippostal 邮编
* @apiSuccess {Number} data.industryId  行业类型id
* @apiSuccess {String} data.industryName  行业类型
* @apiSuccess {String} data.createdUserId  创建人usrId
* @apiSuccess {String} data.createdUserName  创建人userName
* @apiSuccess {Number} data.status 当前客户数据状态 0-编辑中 1-启用 2-停用中
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	return Companies.findOne({ where: { id: ctx.params.id } })
		.then(res => {
			if (res) {
				delete res.updatedAt;
				delete res.pinyin;

				ctx.body = ServiceResult.getSuccess(res);
			} else {
				ctx.body = ServiceResult.getFail('参数错误');
			}
			next();
		}).catch(error => {
			console.error('获取客户信息失败', error);
			ctx.body = ServiceResult.getFail('获取客户信息失败');
			next();
		});
});

/**
* @api {put} /api/companies/:id 修改客户
* @apiName company-modify
* @apiGroup 客户
* @apiDescription 修改客户
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiParam {String} [name] 客户名称
* @apiParam {String} [shortname] 名称缩写
* @apiParam {String} [costcenter] 客户代码（财务编号）
* @apiParam {Number} [industryId]  行业类型id
* @apiParam {String} [provinceCode] 省份编码
* @apiParam {String} [cityCode] 城市编码
* @apiParam {String} [districtCode]  区县编码
* @apiParam {String} [street]  地址详细
* @apiParam {String} [email] 邮箱
* @apiParam {String} [mainphone] 电话总机
* @apiParam {String} [zippostal] 邮编
* @apiParam {String} [description] 描述
* @apiParam {Number} [status] 当前客户数据状态 1-启用 2-停用中, 此处不允许为0，需求中不允许回到编辑状态
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	const companyData = {};

	// 复制基本信息
	util.setProperty([ 'name', 'shortname', 'costcenter', 'street', 'email',
		'mainphone', 'zippostal', 'description' ], data, companyData);
	// 处理省市区信息
	if (data.provinceCode) {
		companyData.provinceCode = data.provinceCode;
		companyData.provinceName = areaMap.province[data.provinceCode];
	}
	if (data.provinceCode) {
		companyData.cityCode = data.cityCode;
		companyData.cityName = areaMap.city[data.cityCode];
	}
	if (data.districtCode) {
		companyData.districtCode = data.districtCode;
		companyData.districtName = areaMap.district[data.districtCode];
	}
	// 修改客户信息状态，此处过滤掉编辑中状态，需求中编辑启用后就不允许回到编辑状态中
	if (data.status) companyData.status = Number(data.status);

	return Companies.findOne({ where: { id: ctx.params.id } })
		.then(company => {
			if (!company) {
				return Promise.reject('获取客户信息失败');
			}

			if (data.name || data.shortname) {
				companyData.pinyin = {
					name: util.getPinyin(data.name || company.name),
					shortname: util.getPinyin(data.shortname || company.shortname || data.name)
				};
			}

			return Companies.update(companyData, { where: { id: ctx.params.id } });
		}).then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('修改客户信息失败', error);
			ctx.body = ServiceResult.getFail(error);
			next();
		});
});

/**
* @api {post} /api/companies/status 设置当前状态
* @apiName company-status
* @apiGroup 客户
* @apiDescription 设置当前状态 当前客户数据状态 1-启用 2-停用中
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 客户id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/:id/status', async (ctx, next) => {
	const { id, status } = ctx.request.body;

	return Companies.update({ status: Number(status), where: { id } })
		.then(() => {
			ctx.body = ServiceResult.getSuccess({});
			next();
		}).catch(error => {
			console.error('设置客户当前状态失败', error);
			ctx.body = ServiceResult.getFail('设置失败');
			next();
		});
});

module.exports = router;
