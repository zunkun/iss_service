const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const { isOE } = require('../core/auth');
const FC = require('../models/FC');
const IC = require('../models/IC');

router.prefix('/api/ics');

/**
* @api {get}/api/ics?fcId= 检查项列表
* @apiName ic-query
* @apiGroup 检查项
* @apiDescription 检查项列表，datatype=1时有数据 [stateA,stateB,stateC,stateD,normal], datatype=2时有数据 [high,low,unit]
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} fcId 设备fc的id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 检查项列表
* @apiSuccess {String} data.name 检查项目名称
* @apiSuccess {Number} data.frequency 建议频率
* @apiSuccess {Number} data.datatype 录入数据类型 1-选择项目 2-信息录入
* @apiSuccess {String} data.stateA  状态A
* @apiSuccess {String} data.stateB  状态B
* @apiSuccess {String} data.stateC  状态C
* @apiSuccess {String} data.stateD  状态D
* @apiSuccess {Number} data.normal  正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiSuccess {Number} data.hign  上限
* @apiSuccess {Number} data.low  下限
* @apiSuccess {String} data.unit  单位
* @apiSuccess {Number} data.remark 备注
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/', async (ctx, next) => {
	let { fcId } = ctx.query;
	const fc = await FC.findOne({ where: { id: fcId } });
	if (!fcId || !fc) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}

	const ics = await IC.findAll({ where: { fcId } });
	let res = [];
	for (let ic of ics) {
		let data = {
			name: ic.name,
			frequency: ic.frequency,
			datatype: ic.datatype,
			remark: ic.remark
		};
		if (ic.datatype === 1) {
			[ 'stateA', 'stateB', 'stateC', 'stateD', 'normal' ].map(key => {
				data[key] = ic[key];
			});
		} else {
			[ 'high', 'low', 'unit' ].map(key => {
				data[key] = ic[key];
			});
		}
		res.push(data);
	}
	ctx.body = ServiceResult.getSuccess(res);
	await next();
});

/**
* @api {post}/api/ics 创建检查项
* @apiName ic-create
* @apiGroup 检查项
* @apiDescription 创建检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} fcId 设备fc的id
* @apiParam {String} name 检查项目名称
* @apiParam {Number} datatype 录入数据类型 1-选择项目 2-信息录入
* @apiParam {String} [stateA] 状态A, datatype=== 1时填写
* @apiParam {String} [stateB] 状态B, datatype=== 1时填写
* @apiParam {String} [stateC] 状态C, datatype=== 1时填写
* @apiParam {String} [stateD] 状态D, datatype=== 1时填写
* @apiParam {Number} [normal] 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiParam {String} [unit] 录入数据单位，datatype=== 2时填写
* @apiParam {Number} [high] 上限，datatype=== 2时填写
* @apiParam {Number} [low] 下限，datatype=== 2时填写
* @apiParam {String} [remark] 备注
* @apiParam {Number} [frequency] 频率 参考常量中frequencyMap
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 检查项信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	let valid = true;
	let fc = await FC.findOne({ where: { id: data.fcId } });
	let icData = { name: data.name, datatype: data.datatype, remark: data.remark, frequency: data.frequency, fcId: data.fcId };
	if (!data.name || !data.fcId || !fc || !data.datatype) {
		valid = false;
	}

	if (data.datatype === 1) {
		if (!data.stateA && !data.stateB && !data.stateC && !data.stateD) valid = false;
		if (!data.normal) valid = false;
		icData.normal = data.normal;
		[ 'stateA', 'stateB', 'stateC', 'stateD' ].map(key => {
			icData[key] = data[key];
		});
	} else {
		[ 'high', 'low', 'unit' ].map(key => {
			if (!data[key]) valid = false;
			icData[key] = data[key];
		});
	}
	if (!valid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	let ic = await IC.create(icData);
	ctx.body = ServiceResult.getSuccess(ic);
	await next();
});

/**
* @api {get}/api/ics/:id 检查项信息
* @apiName ic-info
* @apiGroup 检查项
* @apiDescription 检查项信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 检查项信息
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	let ic = await IC.findOne({ where });
	ctx.body = ServiceResult.getSuccess(ic);
	await next();
});

/**
* @api {put}/api/fcs/:fcId/ics/:id 修改检查项
* @apiName ic-modify
* @apiGroup 检查项
* @apiDescription 修改检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 检查项id
* @apiParam {Number} [fcId] 设备fc的id
* @apiParam {String} [name] 检查项目名称
* @apiParam {Number} [datatype] 录入数据类型 1-选择项目 2-信息录入
* @apiParam {String} [stateA] 状态A, datatype=== 1时填写
* @apiParam {String} [stateB] 状态B, datatype=== 1时填写
* @apiParam {String} [stateC] 状态C, datatype=== 1时填写
* @apiParam {String} [stateD] 状态D, datatype=== 1时填写
* @apiParam {Number} [normal] 正确的状态 1-stateA 2-stateB 3-stateC 4-stateD
* @apiParam {String} [unit] 录入数据单位，datatype=== 2时填写
* @apiParam {Number} [high] 上限，datatype=== 2时填写
* @apiParam {Number} [low] 下限，datatype=== 2时填写
* @apiParam {String} [remark] 备注
* @apiParam {Number} [frequency] 频率 参考常量中frequencyMap
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', isOE(), async (ctx, next) => {
	const data = ctx.request.body;
	let valid = true;
	let icData = { datatype: data.datatype };
	if (data.datatype === 1) {
		if (!data.stateA && !data.stateB && !data.stateC && !data.stateD) valid = false;
		if (!data.normal) valid = false;
		icData.normal = data.normal;
		[ 'stateA', 'stateB', 'stateC', 'stateD' ].map(key => {
			icData[key] = data[key];
		});
	} else if (data.datatype === 2) {
		[ 'high', 'low', 'unit' ].map(key => {
			if (!data[key]) valid = false;
			icData[key] = data[key];
		});
	}
	[ 'name', 'frequency', 'remark' ].map(key => {
		if (data[key]) icData[key] = data[key];
	});
	if (!valid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await IC.update(icData, { where: { id: ctx.params.id }	});
	ctx.body = ServiceResult.getSuccess({});
	await next();
});

/**
* @api {delete}/api/ics/:id 删除检查项
* @apiName ic-delete
* @apiGroup 检查项
* @apiDescription 删除检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', isOE(), async (ctx, next) => {
	// TODO: 检查项删除其他表处理
	const where = { id: ctx.params.id };

	await IC.destroy({ where });
	await next();
});

module.exports = router;
