const Router = require('koa-router');
const multer = require('koa-multer');
const ServiceResult = require('../core/ServiceResult');
const template = require('../config/template');
const send = require('koa-send');
const Files = require('../models/Files');
const FileService = require('../services/FileService');
const jwt = require('jsonwebtoken');
const CompanyService = require('../services/CompanyService');
const LocationService = require('../services/LocationService');
const BuildingService = require('../services/BuildingService');
const FloorService = require('../services/FloorService');
const SpaceService = require('../services/SpaceService');

const fileStorage = multer.diskStorage({
	// 文件保存路径
	destination: (req, file, cb) => {
		cb(null, 'public/files/upload/');
	},
	// 修改文件名称
	filename: (req, file, cb) => {
		const fileFormat = (file.originalname).split('.'); // 以点分割成数组，数组的最后一项就是后缀名
		cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1]);
	}
});
const imageStorage = multer.diskStorage({
	// 文件保存路径
	destination: (req, file, cb) => {
		cb(null, 'public/images/');
	},
	// 修改文件名称
	filename: (req, file, cb) => {
		const fileFormat = (file.originalname).split('.'); // 以点分割成数组，数组的最后一项就是后缀名
		cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1]);
	}
});
// 加载配置
const fileUpload = multer({ storage: fileStorage, limits: { fileSize: '10M', files: 1 } });
const imageUpload = multer({
	storage: imageStorage,
	limits: { fileSize: '10M', files: 1 },
	fileFilter: (req, file, cb) => {
		const fileFormat = (file.originalname).split('.'); // 以点分割成数组，数组的最后一项就是后缀名
		const ext = (fileFormat[fileFormat.length - 1] || '').toLowerCase();

		let isLeagal = [ 'jpg', 'jpeg', 'png' ].indexOf(ext) > -1;
		if (isLeagal) {
			cb(null, true);
		} else {
			cb(new Error('必须上传 .jpg 或 .png 格式的图片'));
		}
	}
});

const router = new Router();

router.prefix('/api/files');

/**
* @api {post} /api/files/upload 上传EXCEL文件
* @apiName file-upload
* @apiGroup 文件
* @apiHeader {String} authorization 登录token Bearer + token
* @apiDescription 上传Excel文件,该Excel文件必须是系统下载的Excel模板，比如“客户信息模板.xlsx”, 注意文件最大限制10M，只允许上传单文件 【需要登录】
* @apiParam {String} type 文件类型，请查看文件模板列表
* @apiParam  {File} file 文件信息
* @apiSuccess {Object} data 返回值
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {}
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/upload', fileUpload.single('file'), async (ctx, next) => {
	let user = jwt.decode(ctx.header.authorization.substr(7));
	const { type } = ctx.req.body;
	const fileInfo = ctx.req.file;
	if (!user || !user.userId) {
		ctx.body = ServiceResult.getFail('鉴权失败');
		return;
	}
	if (!template[type]) {
		ctx.body = ServiceResult.getFail('参数错误');
		return;
	}
	let status = 0;

	try {
		let filedatas = FileService.parseExcel(fileInfo.filename);
		console.log({ filedatas });
		switch (type) {
		case 'company':
			CompanyService.saveCompanines(filedatas, user);
			break;
		case 'location':
			LocationService.saveLocations(filedatas, user);
			break;
		case 'building':
			BuildingService.saveBuildings(filedatas, user);
			break;
		case 'floor':
			FloorService.saveFloors(filedatas, user);
			break;
		case 'space':
			SpaceService.saveSpaces(filedatas, user);
			break;
		default:
			break;
		}
		Files.create({
			type,
			name: fileInfo.filename,
			origin: fileInfo.originalname,
			userId: user.userId,
			userName: user.userName,
			status
		});

		ctx.body = ServiceResult.getSuccess({});
	} catch (error) {
		console.log('上传文件失败', error);
		ctx.body = ServiceResult.getFail('上传文件失败');
		next();
	}
});

/**
* @api {get} /api/files/template?type= 下载模板
* @apiName file-template
* @apiGroup 文件
* @apiDescription 下载模板，需要提供需要下载的文件类型 type, 类型列表请查看模板列表
* @apiParam {String} type 模板类型 比如 type=company标识下载客户信息模板
* @apiSuccess {Object} data 返回值
*/
router.get('/template', async (ctx, next) => {
	const name = template[ctx.query.type];
	if (!name) {
		ctx.body = ServiceResult.getFail('参数不正确');
		return;
	}
	const path = `public/files/template/${name}.xlsx`;
	ctx.attachment(path);
	await send(ctx, path);
	await next();
});

/**
* @api {get} /api/files/types 模板列表
* @apiName file-types
* @apiGroup 文件
* @apiDescription 查看系统提供的模板列表
* @apiSuccess {Object[]} data 模板列表
* @apiSuccess {String} data.type 模板类型type
* @apiSuccess {String} data.name 模板名称
*/
router.get('/types', async (ctx, next) => {
	let data = [];
	for (let type of Object.keys(template)) {
		data.push({ type, name: template[type] });
	}
	ctx.body = ServiceResult.getSuccess(data);
	await next();
});

/**
* @api {post} /api/files/images 上传图片
* @apiName file-images
* @apiGroup 文件
* @apiHeader {String} authorization 登录token Bearer + token
* @apiDescription 上传图片, 注意文件最大限制10M，只允许上传 .png .jpg 格式的图片 【需要登录】，获取图片请使用 'server_host + /images/:name'
* @apiParam  {File} file 文件信息
* @apiSuccess {Object} data 返回值
* @apiSuccess {Number} errcode 成功为0
* @apiSuccess {Object} data {} 图片信息
* @apiSuccess {Object} data.name  图片名称
* @apiError {Number} errcode 失败不为0
* @apiError {Number} errmsg 错误消息
*/
router.post('/image', imageUpload.single('image'), async (ctx, next) => {
	const imageInfo = ctx.req.image;
	let user = jwt.decode(ctx.header.authorization.substr(7));

	if (!user || !user.userId) {
		ctx.body = ServiceResult.getFail('鉴权失败');
		return;
	}

	ctx.body = ServiceResult.getSuccess({ name: imageInfo.filename });
	next();
});

module.exports = router;
