const should = require('should');
const Buildings = require('../../models/Buildings');
const Floors = require('../../models/Floors');
const Locations = require('../../models/Locations');

describe('/api/floors', () => {
	let floor;
	let floor2;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', category: 0 } });
		this.building = await Buildings.findOne({ where: { name: '上海复旦软件园2', locationId: this.location.id } });
	});

	it('新增floors POST /api/floors', (done) => {
		process.request
			.post('/api/floors')
			.set('Authorization', process.token)
			.send({
				name: '1F',
				description: 'description',
				floorClassId: 50,
				floorMaintained: true,
				grossarea: 200,
				grossinternalarea: 100,
				grossexternarea: 100,
				level: 1,
				buildingId: this.building.id
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				floor = resData.data;
				should.equal(floor.name, '1F');
				should.equal(floor.locationId, this.building.locationId);
				should.equal(floor.buildingId, this.building.id);
				should.equal(floor.description, 'description');
				should.equal(floor.floorClassId, 50);
				should.exist(floor.floorClass);
				should.equal(floor.floorMaintained, true);
				should.equal(floor.grossarea, 200);
				should.equal(floor.grossexternarea, 100);
				should.equal(floor.grossinternalarea, 100);
				should.equal(floor.level, 1);
				done();
			});
	});

	it('新增floors POST /api/floors', (done) => {
		process.request
			.post('/api/floors')
			.set('Authorization', process.token)
			.send({
				name: '2F',
				description: 'description',
				floorClassId: 52,
				floorMaintained: true,
				grossarea: 200,
				grossinternalarea: 100,
				grossexternarea: 100,
				level: 2,
				buildingId: this.building.id
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				floor2 = resData.data;
				should.equal(floor2.name, '2F');
				should.equal(floor2.locationId, this.building.locationId);
				should.equal(floor2.buildingId, this.building.id);
				should.equal(floor2.description, 'description');
				should.equal(floor2.floorClassId, 52);
				should.exist(floor2.floorClass);
				should.equal(floor2.floorMaintained, true);
				should.equal(floor2.grossarea, 200);
				should.equal(floor2.grossexternarea, 100);
				should.equal(floor2.grossinternalarea, 100);
				should.equal(floor2.level, 2);
				done();
			});
	});

	it('查询floor GET /api/floors/:id', (done) => {
		process.request
			.get(`/api/floors/${floor.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				floor = resData.data;
				should.equal(floor.name, '1F');
				should.equal(floor.locationId, this.building.locationId);
				should.equal(floor.buildingId, this.building.id);
				should.equal(floor.description, 'description');
				should.equal(floor.floorClassId, 50);
				should.exist(floor.floorClass);
				should.equal(floor.floorMaintained, true);
				should.equal(floor.grossarea, 200);
				should.equal(floor.grossexternarea, 100);
				should.equal(floor.grossinternalarea, 100);
				should.equal(floor.level, 1);
				done();
			});
	});

	it('修改floor PUT /api/floors/:id', (done) => {
		process.request
			.put(`/api/floors/${floor.id}`)
			.set('Authorization', process.token)
			.send({
				name: '3F'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Floors.findOne({ where: { id: floor.id } }).then((_floor) => {
					should.equal(_floor.name, '3F');
					done();
				});
			});
	});

	it('查询floor列表 GET /api/floors?buildingId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/floors?buildingId=${this.building.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});
});
