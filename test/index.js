process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const app = require('../bin/www');
process.request = require('supertest')(app);

process.token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NTA4MzQ2NTIxMzY1MTU5IiwidXNlck5hbWUiOiLliJjpgbXlnaQiLCJqb2JudW1iZXIiOiIiLCJpYXQiOjE1NjIxMzY3MDB9.-sAZ9iLmKF8tqVUu0w_u-BL_c0o0afF9IYRUoqHxSko';
process.user = {
	id: 31,
	userId: '4508346521365159',
	userName: '刘遵坤',
	jobnumber: '',
	avatar: 'https://static.dingtalk.com/media/lADPDgQ9qUPUYknNAYDNAYA_384_384.jpg',
	mobile: '15618871296',
	isAdmin: true,
	isBoss: false,
	position: '流程管理平台研发中心高级工程师',
	email: '',
	role: 3
};

console.log('-------------API 测试-------------');

describe('测试 /api/companies', () => {
	require('./api/companies');
});

describe('测试 /api/locations', () => {
	require('./api/locations');
});

describe('测试 /api/personnels', () => {
	require('./api/personnels');
});

describe('测试 /api/buildings', () => {
	require('./api/buildings');
});

describe('测试 /api/floors', () => {
	require('./api/floors');
});

describe('测试 /api/spaces', () => {
	require('./api/spaces');
});

describe('测试 /api/specs', () => {
	require('./api/specs');
});

describe('测试 /api/inspections', () => {
	require('./api/inspections');
});

describe('测试 /api/handovers', () => {
	require('./api/handovers');
});

describe('测试 /api/equipments', () => {
	require('./api/equipments');
});

describe('测试項目提交審批', () => {
	require('./api/reviews');
});
