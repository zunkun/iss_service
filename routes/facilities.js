const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const FC = require('../models/FC');
const FIC = require('../models/FIC');
const Facilities = require('../models/Facilities');
const FIs = require('../models/FIs');
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');

// 设备录入管理
router.prefix('/api/facilities');

/**
* @api {get} /api/facilities?code=&name=&system=&fcId=&projectId=&buildingId=&floorId=&spaceId=&limit=&page=&keywords=&status= 设备录入列表
* @apiName facilities-query
* @apiGroup 设备录入
* @apiDescription 设备录入列表
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} [code] 设备code
* @apiParam {String} [name] 设备名称
* @apiParam {Number} [system] 设备系统id
* @apiParam {Number} [fcId] 设备类id
* @apiParam {Number} [projectId] 项目id
* @apiParam {Number} [buildingId] 楼房id
* @apiParam {Number} [floorId] 楼层id
* @apiParam {Number} [spaceId] 空间id
* @apiParam {Number} [limit] 分页条数，默认10
* @apiParam {Number} [page] 第几页，默认1
* @apiParam {String} [keywords] 关键词查询
* @apiParam {String} [status] 设备状态 1-编辑中 2-已提交
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 设备列表
* @apiSuccess {Number} data.id 设备录入id
* @apiSuccess {String} data.code 设备录入编码
* @apiSuccess {String} data.name 设备录入别
* @apiSuccess {Boolean} data.inspect 是否巡检
* @apiSuccess {Number} data.system 设备录入系统
* @apiSuccess {Number} data.fcId 设备类id
* @apiSuccess {String} data.fcName 设备类别
* @apiSuccess {Number} data.status 状态 1-编辑中 2-已提交
* @apiSuccess {Object[]}data.fis 检查项目
* @apiSuccess {Number}data.fis.id 检查项目id
* @apiSuccess {String}data.fis.name 检查项目名称
* @apiSuccess {String}data.fis.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String}data.fis.stateA 状态A
* @apiSuccess {String}data.fis.stateB 状态B
* @apiSuccess {String}data.fis.stateC 状态C
* @apiSuccess {String}data.fis.stateD 状态D
* @apiSuccess {String}data.fis.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String}data.fis.unit 录入数据单位
* @apiSuccess {String}data.fis.high 上限
* @apiSuccess {String}data.fis.low 下限
* @apiSuccess {String}data.fis.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { page, limit, keywords } = ctx.query;
	page = Number(page) || 1;
	limit = Number(limit) || 10;
	let offset = (page - 1) * limit;
	const where = {};
	if (keywords && keywords !== 'undefined') {
		where.name = { [Op.like]: `%${keywords}%` };
	}
	[ 'projectId', 'buildignId', 'floorId', 'spaceId', 'code', 'name', 'system', 'status' ].map(key => {
		if (ctx.query[key]) where[key] = ctx.query[key];
	});

	let facilities = await Facilities.findAndCountAll({ where, limit, offset, include: [ { model: FIs } ] });
	ctx.body = ServiceResult.getSuccess(facilities);
	await next();
});

/**
* @api {post} /api/facilities 创建设备录入
* @apiName facilities-create
* @apiGroup 设备录入
* @apiDescription 创建设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} code 设备编码
* @apiParam {String} name 设备录入名称
* @apiParam {Number} fcId 设备类Id
* @apiParam {Number} spaceId 空间/房间ID
* @apiParam {Boolean} [inspect] 是否巡检，默认不巡检
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备录入信息
* @apiSuccess {Number} data.id 设备录入id
* @apiSuccess {String} data.code 设备录入编码
* @apiSuccess {String} data.name 设备录入别
* @apiSuccess {Boolean} data.inspect 是否巡检
* @apiSuccess {Number} data.system 设备录入系统
* @apiSuccess {Number} data.fcId 设备类id
* @apiSuccess {String} data.fcName 设备类别
* @apiSuccess {Number} data.status 状态 1-编辑中 2-已提交
* @apiSuccess {Object[]}data.fis 检查项目
* @apiSuccess {Number}data.fis.id 检查项目id
* @apiSuccess {String}data.fis.name 检查项目名称
* @apiSuccess {String}data.fis.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String}data.fis.stateA 状态A
* @apiSuccess {String}data.fis.stateB 状态B
* @apiSuccess {String}data.fis.stateC 状态C
* @apiSuccess {String}data.fis.stateD 状态D
* @apiSuccess {String}data.fis.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String}data.fis.unit 录入数据单位
* @apiSuccess {String}data.fis.high 上限
* @apiSuccess {String}data.fis.low 下限
* @apiSuccess {String}data.fis.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', async (ctx, next) => {
	const { spaceId, code, name, fcId, inspect } = ctx.request.body;
	let space = await Spaces.findOne({ where: { id: spaceId } });
	let fc = await FC.findOne({ where: { id: Number(fcId) } });

	if (!spaceId || !space || !code || !name || !fcId || !fc) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let facility = await Facilities.findOne({ where: { code } });
	if (facility) {
		ctx.body = ServiceResult.getFail('已存在该设备录入');
	}
	let fics = await FIC.findAll({ where: { fcId }, raw: true });

	facility = await Facilities.create({
		code,
		name,
		inspect,
		statu: 1,
		system: fc.system,
		fcId,
		fcName: fc.name,
		description: fc.description,
		projectId: space.projectId,
		buildingId: space.buildingId,
		floorId: space.floorId,
		spaceId,
		oesv: 'sv'
	});

	let fis = [];
	for (let fic of fics) {
		delete fic.id;
		delete fic.createdAt;
		delete fic.updatedAt;
		fic.facilityId = facility.id;
		fis.push(fic);
	}
	await FIs.bulkCreate(fis);

	facility = await Facilities.findOne({ where: { code }, include: [ { model: FIs } ] });
	ctx.body = ServiceResult.getSuccess(facility);
	await next();
});

/**
* @api {get} /api/facilities/:id 设备录入信息
* @apiName facilities-info
* @apiGroup 设备录入
* @apiDescription 设备录入信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备录入id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备录入信息
* @apiSuccess {Number} data.id 设备录入id
* @apiSuccess {String} data.code 设备录入编码
* @apiSuccess {String} data.name 设备录入别
* @apiSuccess {Boolean} data.inspect 是否巡检
* @apiSuccess {Number} data.system 设备录入系统
* @apiSuccess {Number} data.fcId 设备类id
* @apiSuccess {String} data.fcName 设备类别
* @apiSuccess {Number} data.status 状态 1-编辑中 2-已提交
* @apiSuccess {Object[]}data.fis 检查项目
* @apiSuccess {Number}data.fis.id 检查项目id
* @apiSuccess {String}data.fis.name 检查项目名称
* @apiSuccess {String}data.fis.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String}data.fis.stateA 状态A
* @apiSuccess {String}data.fis.stateB 状态B
* @apiSuccess {String}data.fis.stateC 状态C
* @apiSuccess {String}data.fis.stateD 状态D
* @apiSuccess {String}data.fis.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String}data.fis.unit 录入数据单位
* @apiSuccess {String}data.fis.high 上限
* @apiSuccess {String}data.fis.low 下限
* @apiSuccess {String}data.fis.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let facility = await Facilities.findOne({ where: { id: ctx.params.id }, include: [ { model: FIs } ] });
	ctx.body = ServiceResult.getSuccess(facility);
	await next();
});

/**
* @api {put} /api/facilities/:id 修改设备录入
* @apiName facilities-modify
* @apiGroup 设备录入
* @apiDescription 修改设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备录入id
* @apiParam {String} [code] 设备编码
* @apiParam {String} [name] 设备录入名称
* @apiParam {Number} [fcId] 设备类Id
* @apiParam {Boolean} [inspect] 是否巡检，默认不巡检
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备录入信息
* @apiSuccess {Object} data.id 设备录入id
* @apiSuccess {Object} data.code 设备录入编码
* @apiSuccess {Object} data.name 设备录入别
* @apiSuccess {Object} data.inspect 是否巡检
* @apiSuccess {Object} data.system 设备录入系统
* @apiSuccess {Object} data.fcId 设备类id
* @apiSuccess {Object} data.fcName 设备类别
* @apiSuccess {Number} data.status 状态 1-编辑中 2-已提交
* @apiSuccess {Object[]}data.fis 检查项目
* @apiSuccess {Number}data.fis.id 检查项目id
* @apiSuccess {String}data.fis.name 检查项目名称
* @apiSuccess {String}data.fis.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String}data.fis.stateA 状态A
* @apiSuccess {String}data.fis.stateB 状态B
* @apiSuccess {String}data.fis.stateC 状态C
* @apiSuccess {String}data.fis.stateD 状态D
* @apiSuccess {String}data.fis.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String}data.fis.unit 录入数据单位
* @apiSuccess {String}data.fis.high 上限
* @apiSuccess {String}data.fis.low 下限
* @apiSuccess {String}data.fis.remark 备注
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	let facility = await Facilities.findOne({ where: { id: ctx.params.id } });
	if (!facility) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	let facilityData = {};
	if (data.name) facilityData.name = data.name;
	if (data.code) {
		let facility2 = await Facilities.findOne({ where: { code: data.code } });
		if (facility2) {
			ctx.body = ServiceResult.getFail(`已存在code=${data.code}的设备，不可修改为该code`);
			return;
		}
		facilityData.code = data.code;
	}

	// 修改了设备类型
	if (data.fcId && facility.fcId !== data.fcId) {
		let fc = await FC.findOne({ where: { id: data.fcId } });
		if (!fc) {
			ctx.body = ServiceResult.getFail('参数不正确');
			return;
		}
		facilityData.fcId = data.fcId;
		facilityData.fcName = fc.name;

		let fics = await FIC.findAll({ where: { fcId: data.fcId }, raw: true });

		let fis = [];
		for (let fic of fics) {
			delete fic.id;
			delete fic.createdAt;
			delete fic.updatedAt;
			fic.facilityId = facility.id;
			fis.push(fic);
		}
		// 删除旧的检查项，创建新的检查项
		await FIs.destroy({ where: { facilityId: facility.id } });
		await FIs.bulkCreate(fis);
	}

	// 更新facility信息
	await Facilities.update(facilityData, { where: { id: ctx.params.id } });

	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/facilities/:id 删除设备录入
* @apiName facilities-delete
* @apiGroup 设备录入
* @apiDescription 删除设备录入
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 设备录入id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	await Facilities.destroy({ where: { id: ctx.params.id } });
	await FIs.destroy({ where: { facility: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

module.exports = router;
