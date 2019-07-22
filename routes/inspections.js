const ServiceResult = require('../core/ServiceResult');
const Router = require('koa-router');
const router = new Router();
const Specs = require('../models/Specs');
const Inspections = require('../models/Inspections');

router.prefix('/api/inspections');

/**
* @api {get}/api/inspections?specId= 设备类检查项列表
* @apiName fic-query
* @apiGroup 设备类检查项
* @apiDescription 设备类检查项列表，datatype=1时有数据 [stateA,stateB,stateC,stateD,normal], datatype=2时有数据 [high,low,unit]
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} specId 设备spec的id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object[]} data 设备类检查项列表
* @apiSuccess {String} data.name 设备类检查项目名称
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
	let { specId } = ctx.query;

	return Specs.findOne({ where: { id: specId } })
		.then(spec => {
			if (!specId || !spec) {
				ctx.body = ServiceResult.getFail('参数错误');
				return;
			}
			return Inspections.findAll({ where: { specId } })
				.then(inspections => {
					let res = [];
					for (let fic of inspections) {
						let data = {
							name: fic.name,
							frequency: fic.frequency,
							datatype: fic.datatype,
							remark: fic.remark
						};
						if (fic.datatype === 1) {
							[ 'stateA', 'stateB', 'stateC', 'stateD', 'normal' ].map(key => {
								data[key] = fic[key];
							});
						} else {
							[ 'high', 'low', 'unit' ].map(key => {
								data[key] = fic[key];
							});
						}
						res.push(data);
					}
					ctx.body = ServiceResult.getSuccess(res);
					next();
				});
		}).catch(error => {
			console.log('查询inspections失败', error);
			ctx.body = ServiceResult.getFail('查询失败');
		});
});

/**
* @api {post}/api/inspections 创建设备类检查项
* @apiName fic-create
* @apiGroup 设备类检查项
* @apiDescription 创建设备类检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} specId 设备spec的id
* @apiParam {String} name 设备类检查项目名称
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
* @apiSuccess {Object} data 设备类检查项信息
* @apiSuccess {Number} data.id 设备类检查项id
* @apiSuccess {String} data.name 设备类检查项目名称
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
router.post('/', async (ctx, next) => {
	const data = ctx.request.body;
	let valid = true;
	let spec = await Specs.findOne({ where: { id: data.specId } });
	let inspectionData = { name: data.name, datatype: data.datatype, remark: data.remark, frequency: data.frequency, specId: data.specId };
	if (!data.name || !data.specId || !spec || !data.datatype) {
		valid = false;
	}

	if (data.datatype === 1) {
		if (!data.stateA && !data.stateB && !data.stateC && !data.stateD) valid = false;
		if (!data.normal) valid = false;
		inspectionData.normal = data.normal;
		[ 'stateA', 'stateB', 'stateC', 'stateD' ].map(key => {
			inspectionData[key] = data[key];
		});
	} else {
		[ 'high', 'low', 'unit' ].map(key => {
			if (!data[key]) valid = false;
			inspectionData[key] = data[key];
		});
	}
	if (!valid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	return Inspections.create(inspectionData).then(inspection => {
		ctx.body = ServiceResult.getSuccess(inspection);
		next();
	}).catch(error => {
		console.log('创建inspectionr失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {get}/api/inspections/:id 设备类检查项信息
* @apiName fic-info
* @apiGroup 设备类检查项
* @apiDescription 设备类检查项信息
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data 设备类检查项信息
* @apiSuccess {Number} data.id 设备类检查项id
* @apiSuccess {String} data.name 设备类检查项目名称
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
router.get('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Inspections.findOne({
		where,
		attributes: { exclude: [ 'createdAt', 'updatedAt', 'deletedAt' ] }
	}).then(inspection => {
		ctx.body = ServiceResult.getSuccess(inspection);
		next();
	}).catch(error => {
		console.log('查询inspectionr失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

/**
* @api {put}/api/inspections/:id 修改设备类检查项
* @apiName fic-modify
* @apiGroup 设备类检查项
* @apiDescription 修改设备类检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {Number} id 设备类检查项id
* @apiParam {String} [name] 设备类检查项目名称
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
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.put('/:id', async (ctx, next) => {
	const data = ctx.request.body;
	let valid = true;
	let inspectionData = { datatype: data.datatype };
	if (data.datatype === 1) {
		if (!data.stateA && !data.stateB && !data.stateC && !data.stateD) valid = false;
		if (!data.normal) valid = false;
		inspectionData.normal = data.normal;
		[ 'stateA', 'stateB', 'stateC', 'stateD' ].map(key => {
			inspectionData[key] = data[key];
		});
	} else if (data.datatype === 2) {
		[ 'high', 'low', 'unit' ].map(key => {
			if (!data[key]) valid = false;
			inspectionData[key] = data[key];
		});
	}
	[ 'name', 'frequency', 'remark' ].map(key => {
		if (data[key]) inspectionData[key] = data[key];
	});
	if (!valid) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	await Inspections.update(inspectionData, { where: { id: ctx.params.id }	})
		.then(inspection => {
			ctx.body = ServiceResult.getSuccess(inspection);
			next();
		}).catch(error => {
			console.log('修改inspectionr失败', error);
			ctx.body = ServiceResult.getFail('执行错误');
			next();
		});
});

/**
* @api {delete}/api/inspections/:id 删除设备类检查项
* @apiName fic-delete
* @apiGroup 设备类检查项
* @apiDescription 删除设备类检查项
* @apiPermission OE
* @apiHeader {String} authorization 登录token Bearer + token
* @apiParam {String} id 设备类检查项id
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.delete('/:id', async (ctx, next) => {
	const where = { id: ctx.params.id };

	return Inspections.destroy({ where }).then(() => {
		ctx.body = ServiceResult.getSuccess({});
		next();
	}).catch(error => {
		console.log('删除设备类检查项失败', error);
		ctx.body = ServiceResult.getFail('执行错误');
		next();
	});
});

module.exports = router;
