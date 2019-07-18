const postgres = require('../core/db/postgres');
const { DataTypes, Model } = require('sequelize');
const DingStaffs = require('./DingStaffs');

// 工作交接记录
class Handovers extends Model {}

Handovers.init({
	fromStaffId: {
		type: DataTypes.INTEGER,
		comment: '发起人staffId'
	},
	fromUserId: {
		type: DataTypes.STRING,
		comment: '发起人userId'
	},
	fromUserName: {
		type: DataTypes.STRING,
		comment: '发起人姓名'
	},
	fromGps: {
		type: DataTypes.STRING,
		comment: '发起人位置信息'
	},
	fromImages: {
		type: DataTypes.ARRAY(DataTypes.STRING),
		comment: '发起人拍照图片'
	},
	fromRemark: {
		type: DataTypes.TEXT,
		comment: '发起人填写备注信息'
	},
	toStaffId: {
		type: DataTypes.INTEGER,
		comment: '接收人staffId'
	},
	toUserId: {
		type: DataTypes.STRING,
		comment: '接收人userId'
	},
	toUserName: {
		type: DataTypes.STRING,
		comment: '接收人姓名'
	},
	toGps: {
		type: DataTypes.STRING,
		comment: '接收人位置信息'
	},
	toImages: {
		type: DataTypes.ARRAY(DataTypes.STRING),
		comment: '接收人拍照图片'
	},
	toRemark: {
		type: DataTypes.TEXT,
		comment: '接收人填写备注信息'
	},
	date: {
		type: DataTypes.DATEONLY,
		comment: '交接日期'
	},
	startTime: {
		type: DataTypes.DATE,
		comment: '开始交接时间'
	},
	endTime: {
		type: DataTypes.DATE,
		comment: '接收时间'
	},
	category: {
		type: DataTypes.INTEGER,
		comment: '工作交接状态 1-交接中 2-交接成功 3-撤回 4-拒绝'
	}
}, {
	sequelize: postgres,
	modelName: 'handovers',
	comment: '工作交接',
	paranoid: true
});

Handovers.belongsTo(DingStaffs, { as: 'fromStaff' });
Handovers.belongsTo(DingStaffs, { as: 'toStaff' });

Handovers.sync();

module.exports = Handovers;
