const should = require('should');
const Locations = require('../../models/Locations');
const Buildings = require('../../models/Buildings');

describe('/api/buildings', () => {
	let building;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { name: '复旦软件园' } });
	});

	it('新增buildings POST /api/buildings', (done) => {
		process.request
			.post('/api/buildings')
			.set('Authorization', process.token)
			.send({
				locationId: this.location.id,
				name: '复旦软件园A',
				buildingClassId: 20,
				description: '描述',
				mainphone: 'mainphone'
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				building = resData.data;
				should.equal(building.name, '复旦软件园A');
				should.equal(building.locationId, this.location.id);
				should.equal(building.buildingClassId, 20);
				should.exist(building.buildingClass);
				should.equal(building.description, '描述');
				done();
			});
	});

	it('查询building列表 GET /api/buildings?locationId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/buildings?locationId=${this.location.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('查询building GET /api/buildings/:id', (done) => {
		process.request
			.get(`/api/buildings/${building.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '复旦软件园A');
				done();
			});
	});

	it('修改building PUT /api/buildings/:id', (done) => {
		process.request
			.put(`/api/buildings/${building.id}`)
			.set('Authorization', process.token)
			.send({
				name: '复旦软件园'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Buildings.findOne({ where: { id: building.id } }).then((_building) => {
					should.equal(_building.name, '复旦软件园');
					done();
				});
			});
	});
});
