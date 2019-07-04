const should = require('should');
const FC = require('../../models/FC');
const IC = require('../../models/IC');

describe('/api/ics', () => {
	let ic;
	beforeEach(async () => {
		this.fc = await FC.findOne({ where: { name: '复旦空调2' } });
	});

	it('查询ic列表 GET /api/ics?fcId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/ics?fcId=${this.fc.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.exist(res.body.data);
				done();
			});
	});

	it('新增ics 选择项目 POST /api/ics', (done) => {
		process.request
			.post('/api/ics')
			.set('Authorization', process.token)
			.send({
				fcId: this.fc.id,
				name: '带电指示灯',
				datatype: 1,
				stateA: '点亮',
				stateB: '熄灭',
				normal: 1,
				frequency: 1
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				ic = resData.data;
				should.equal(ic.name, '带电指示灯');
				done();
			});
	});

	it('新增ics 输入数据 POST /api/ics', (done) => {
		process.request
			.post('/api/ics')
			.set('Authorization', process.token)
			.send({
				fcId: this.fc.id,
				name: '温度',
				datatype: 2,
				high: 100,
				low: 20,
				unit: '℃'
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				ic = resData.data;
				should.equal(ic.name, '温度');
				done();
			});
	});

	it('查询ic GET /api/ics/:id', (done) => {
		process.request
			.get(`/api/ics/${ic.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '温度');
				done();
			});
	});

	it('修改ic 修改datatype PUT /api/ics/:id', (done) => {
		process.request
			.put(`/api/ics/${ic.id}`)
			.set('Authorization', process.token)
			.send({
				name: '温度2',
				datatype: 1,
				stateA: '正常',
				stateB: '错误',
				stateC: '未知',
				normal: 1
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				IC.findOne({ where: { id: ic.id } }).then((_ic) => {
					should.equal(_ic.name, '温度2');
					done();
				});
			});
	});
});
