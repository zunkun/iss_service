const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE, isSV } = require('../core/auth');
const FC = require('../models/FC');
const IC = require('../models/IC');
const FHSV = require('../models/FHSV');
const IHSV = require('../models/IHSV');
const Spaces = require('../models/Spaces');
const { Op } = require('sequelize');

// SV设备录入
router.prefix('/api/fhsvs');

/**
* @api {get} /api/fhsvs?code=&name=&system=&fcId=&projectId=&buildingId=&floorId=&spaceId=&limit=&page=&keywords=&status= 设备录入列表
* @apiName fhsvs-query
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
* @apiSuccess {Object[]} data.ihsvs 检查项目
* @apiSuccess {Number} data.ihsvs.id 检查项目id
* @apiSuccess {String} data.ihsvs.name 检查项目名称
* @apiSuccess {String} data.ihsvs.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.ihsvs.stateA 状态A
* @apiSuccess {String} data.ihsvs.stateB 状态B
* @apiSuccess {String} data.ihsvs.stateC 状态C
* @apiSuccess {String} data.ihsvs.stateD 状态D
* @apiSuccess {String} data.ihsvs.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.ihsvs.unit 录入数据单位
* @apiSuccess {String} data.ihsvs.high 上限
* @apiSuccess {String} data.ihsvs.low 下限
* @apiSuccess {String} data.ihsvs.remark 备注
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

	let fhsvs = await FHSV.findAndCountAll({ where, limit, offset, include: [ { model: IHSV } ] });
	ctx.body = ServiceResult.getSuccess(fhsvs);
	await next();
});

/**
* @api {post} /api/fhsvs 创建设备录入
* @apiName fhsvs-create
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
* @apiSuccess {Object[]} data.ihsvs 检查项目
* @apiSuccess {Number} data.ihsvs.id 检查项目id
* @apiSuccess {String} data.ihsvs.name 检查项目名称
* @apiSuccess {String} data.ihsvs.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.ihsvs.stateA 状态A
* @apiSuccess {String} data.ihsvs.stateB 状态B
* @apiSuccess {String} data.ihsvs.stateC 状态C
* @apiSuccess {String} data.ihsvs.stateD 状态D
* @apiSuccess {String} data.ihsvs.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.ihsvs.unit 录入数据单位
* @apiSuccess {String} data.ihsvs.high 上限
* @apiSuccess {String} data.ihsvs.low 下限
* @apiSuccess {String} data.ihsvs.remark 备注
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
	let fhsv = await FHSV.findOne({ where: { code } });
	if (fhsv) {
		ctx.body = ServiceResult.getFail('已存在该设备录入');
	}
	let ics = await IC.findAll({ where: { fcId }, raw: true });

	fhsv = await FHSV.create({
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
		spaceId
	});

	let ihsvs = [];
	for (let ic of ics) {
		delete ic.id;
		delete ic.createdAt;
		delete ic.updatedAt;
		ic.fhsvId = fhsv.id;
		ihsvs.push(ic);
	}
	await IHSV.bulkCreate(ihsvs);

	fhsv = await FHSV.findOne({ where: { code }, include: [ { model: IHSV } ] });
	ctx.body = ServiceResult.getSuccess(fhsv);
	await next();
});

/**
* @api {get} /api/fhsvs/:id 设备录入信息
* @apiName fhsvs-info
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
* @apiSuccess {Object[]} data.ihsvs 检查项目
* @apiSuccess {Number} data.ihsvs.id 检查项目id
* @apiSuccess {String} data.ihsvs.name 检查项目名称
* @apiSuccess {String} data.ihsvs.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.ihsvs.stateA 状态A
* @apiSuccess {String} data.ihsvs.stateB 状态B
* @apiSuccess {String} data.ihsvs.stateC 状态C
* @apiSuccess {String} data.ihsvs.stateD 状态D
* @apiSuccess {String} data.ihsvs.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.ihsvs.unit 录入数据单位
* @apiSuccess {String} data.ihsvs.high 上限
* @apiSuccess {String} data.ihsvs.low 下限
* @apiSuccess {String} data.ihsvs.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	let fhsv = await FHSV.findOne({ where: { id: ctx.params.id }, include: [ { model: IHSV } ] });
	ctx.body = ServiceResult.getSuccess(fhsv);
	await next();
});

/**
* @api {put} /api/fhsvs/:id 修改设备录入
* @apiName fhsvs-modify
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
* @apiSuccess {Object[]} data.ihsvs 检查项目
* @apiSuccess {Number} data.ihsvs.id 检查项目id
* @apiSuccess {String} data.ihsvs.name 检查项目名称
* @apiSuccess {String} data.ihsvs.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.ihsvs.stateA 状态A
* @apiSuccess {String} data.ihsvs.stateB 状态B
* @apiSuccess {String} data.ihsvs.stateC 状态C
* @apiSuccess {String} data.ihsvs.stateD 状态D
* @apiSuccess {String} data.ihsvs.normal 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {String} data.ihsvs.unit 录入数据单位
* @apiSuccess {String} data.ihsvs.high 上限
* @apiSuccess {String} data.ihsvs.low 下限
* @apiSuccess {String} data.ihsvs.remark 备注
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	let fhsv = await FHSV.findOne({ where: { id: ctx.params.id } });
	if (!fhsv) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}

	let fhsvData = {};
	if (data.name) fhsvData.name = data.name;
	if (data.code) {
		let fhsv2 = await FHSV.findOne({ where: { code: data.code } });
		if (fhsv2) {
			ctx.body = ServiceResult.getFail(`已存在code=${data.code}的设备，不可修改为该code`);
			return;
		}
		fhsvData.code = data.code;
	}

	// 修改了设备类型
	if (data.fcId && fhsv.fcId !== data.fcId) {
		let fc = await FC.findOne({ where: { id: data.fcId } });
		if (!fc) {
			ctx.body = ServiceResult.getFail('参数不正确');
			return;
		}
		fhsvData.fcId = data.fcId;
		fhsvData.fcName = fc.name;

		let ics = await IC.findAll({ where: { fcId: data.fcId }, raw: true });

		let ihsvs = [];
		for (let ic of ics) {
			delete ic.id;
			delete ic.createdAt;
			delete ic.updatedAt;
			ic.fhsvId = fhsv.id;
			ihsvs.push(ic);
		}
		// 删除旧的检查项，创建新的检查项
		await IHSV.destroy({ where: { fhsvId: fhsv.id } });
		await IHSV.bulkCreate(ihsvs);
	}

	// 更新fhsv信息
	await FHSV.update(fhsvData, { where: { id: ctx.params.id } });

	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete} /api/fhsvs/:id 删除设备录入
* @apiName fhsvs-delete
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
router.delete('/:id', isOE(), async (ctx, next) => {
	await FHSV.destroy({ where: { id: ctx.params.id } });
	await IHSV.destroy({ where: { fhsv: ctx.params.id } });
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

module.exports = router;
