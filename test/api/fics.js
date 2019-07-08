const should = require('should');
const FC = require('../../models/FC');
const FIC = require('../../models/FIC');

describe('/api/fics', () => {
	let fic;
	beforeEach(async () => {
		this.fc = await FC.findOne({ where: { name: '复旦空调2' } });
	});

	it('查询fic列表 GET /api/fics?fcId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/fics?fcId=${this.fc.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.exist(res.body.data);
				done();
			});
	});

	it('新增ics 选择项目 POST /api/fics', (done) => {
		process.request
			.post('/api/fics')
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
				fic = resData.data;
				should.equal(fic.name, '带电指示灯');
				should.equal(fic.fcId, this.fc.id);
				should.equal(fic.datatype, 1);
				should.equal(fic.stateA, '点亮');
				should.equal(fic.stateB, '熄灭');
				should.equal(fic.stateC, null);
				should.equal(fic.stateD, null);
				should.equal(fic.normal, 1);
				should.equal(fic.frequency, 1);
				done();
			});
	});

	it('新增fics 输入数据 POST /api/fics', (done) => {
		process.request
			.post('/api/fics')
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
				fic = resData.data;
				should.equal(fic.name, '温度');
				should.equal(fic.fcId, this.fc.id);
				should.equal(fic.datatype, 2);
				should.equal(fic.high, 100);
				should.equal(fic.low, 20);
				should.equal(fic.unit, '℃');
				done();
			});
	});

	it('查询fic GET /api/fics/:id', (done) => {
		process.request
			.get(`/api/fics/${fic.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '温度');
				done();
			});
	});

	it('修改fic 修改datatype PUT /api/fics/:id', (done) => {
		process.request
			.put(`/api/fics/${fic.id}`)
			.set('Authorization', process.token)
			.send({
				name: '指示灯2',
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

				FIC.findOne({ where: { id: fic.id } }).then((_ic) => {
					should.equal(_ic.name, '指示灯2');
					done();
				});
			});
	});
});
