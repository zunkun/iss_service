const should = require('should');
const Specs = require('../../models/Specs');
describe('/api/specs', () => {
	let spec;
	let spec2;

	it('新增specs POST /api/specs', (done) => {
		process.request
			.post('/api/specs')
			.set('Authorization', process.token)
			.send({
				name: '格力空调',
				description: 'description',
				brandId: 30,
				buildingSystemId: 31,
				serviceClassId: 32,
				specClassId: 33
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				spec = resData.data;
				should.equal(spec.name, '格力空调');
				should.equal(spec.description, 'description');
				should.equal(spec.brandId, 30);
				should.exist(spec.brand);
				should.equal(spec.buildingSystemId, 31);
				should.exist(spec.buildingSystem);
				should.equal(spec.serviceClassId, 32);
				should.exist(spec.serviceClass);
				should.equal(spec.specClassId, 33);
				should.exist(spec.specClass);
				done();
			});
	});

	it('新增specs POST /api/specs', (done) => {
		process.request
			.post('/api/specs')
			.set('Authorization', process.token)
			.send({
				name: '格力空调3',
				description: 'description',
				brandId: 30,
				buildingSystemId: 31,
				serviceClassId: 32,
				specClassId: 33
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				spec2 = resData.data;
				should.equal(spec2.name, '格力空调3');
				should.equal(spec2.description, 'description');
				should.equal(spec2.brandId, 30);
				should.exist(spec2.brand);
				should.equal(spec2.buildingSystemId, 31);
				should.exist(spec2.buildingSystem);
				should.equal(spec2.serviceClassId, 32);
				should.exist(spec2.serviceClass);
				should.equal(spec2.specClassId, 33);
				should.exist(spec2.specClass);
				done();
			});
	});

	it('查询specs列表 GET /api/specs?limit=10&page=1', (done) => {
		process.request
			.get('/api/specs?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('查询spec GET /api/specs/:id', (done) => {
		process.request
			.get(`/api/specs/${spec2.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				spec2 = resData.data;
				should.equal(spec2.name, '格力空调3');
				should.equal(spec2.description, 'description');
				should.equal(spec2.brandId, 30);
				should.exist(spec2.brand);
				should.equal(spec2.buildingSystemId, 31);
				should.exist(spec2.buildingSystem);
				should.equal(spec2.serviceClassId, 32);
				should.exist(spec2.serviceClass);
				should.equal(spec2.specClassId, 33);
				should.exist(spec2.specClass);
				should.exist(spec2.inspections);
				done();
			});
	});

	it('修改spec PUT /api/specs/:id', (done) => {
		process.request
			.put(`/api/specs/${spec.id}`)
			.set('Authorization', process.token)
			.send({
				name: '格力空调2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Specs.findOne({ where: { id: spec.id } }).then((_spec) => {
					should.equal(_spec.name, '格力空调2');
					done();
				});
			});
	});

	it('删除spec PUT /api/specs/:id', (done) => {
		process.request
			.put(`/api/specs/${spec2.id}`)
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
