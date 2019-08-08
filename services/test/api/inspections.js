const should = require('should');
const Specs = require('../../models/Specs');
const Inspections = require('../../models/Inspections');

describe('/api/inspections', () => {
	let inspection;
	let inspection2;
	let inspection3;
	beforeEach(async () => {
		this.spec = await Specs.findOne({ where: { name: '格力空调2' }, order: [ [ 'id', 'DESC' ] ] });
	});

	it('新增ics 选择项目 POST /api/inspections', (done) => {
		process.request
			.post('/api/inspections')
			.set('Authorization', process.token)
			.send({
				specId: this.spec.id,
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
				inspection = resData.data;
				should.equal(inspection.name, '带电指示灯');
				should.equal(inspection.specId, this.spec.id);
				should.equal(inspection.datatype, 1);
				should.equal(inspection.stateA, '点亮');
				should.equal(inspection.stateB, '熄灭');
				should.equal(inspection.stateC, null);
				should.equal(inspection.stateD, null);
				should.equal(inspection.normal, 1);
				should.equal(inspection.frequency, 1);
				done();
			});
	});

	it('新增ics 选择项目 POST /api/inspections', (done) => {
		process.request
			.post('/api/inspections')
			.set('Authorization', process.token)
			.send({
				specId: this.spec.id,
				name: '带电指示灯3',
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
				inspection2 = resData.data;
				should.equal(inspection2.name, '带电指示灯3');
				should.equal(inspection2.specId, this.spec.id);
				should.equal(inspection2.datatype, 1);
				should.equal(inspection2.stateA, '点亮');
				should.equal(inspection2.stateB, '熄灭');
				should.equal(inspection2.stateC, null);
				should.equal(inspection2.stateD, null);
				should.equal(inspection2.normal, 1);
				should.equal(inspection2.frequency, 1);
				done();
			});
	});

	it('查询inspection列表 GET /api/inspections?specId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/inspections?specId=${this.spec.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.exist(res.body.data);
				done();
			});
	});

	it('新增inspections 输入数据 POST /api/inspections', (done) => {
		process.request
			.post('/api/inspections')
			.set('Authorization', process.token)
			.send({
				specId: this.spec.id,
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
				inspection3 = resData.data;
				should.equal(inspection3.name, '温度');
				should.equal(inspection3.specId, this.spec.id);
				should.equal(inspection3.datatype, 2);
				should.equal(inspection3.high, 100);
				should.equal(inspection3.low, 20);
				should.equal(inspection3.unit, '℃');
				done();
			});
	});

	it('查询inspection GET /api/inspections/:id', (done) => {
		process.request
			.get(`/api/inspections/${inspection.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '带电指示灯');
				done();
			});
	});

	it('修改inspection 修改datatype PUT /api/inspections/:id', (done) => {
		process.request
			.put(`/api/inspections/${inspection.id}`)
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

				Inspections.findOne({ where: { id: inspection.id } }).then((_ic) => {
					should.equal(_ic.name, '指示灯2');
					done();
				});
			});
	});

	it('刪除inspection 修改datatype PUT /api/inspections/:id', (done) => {
		process.request
			.delete(`/api/inspections/${inspection3.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				done();
			});
	});
});
