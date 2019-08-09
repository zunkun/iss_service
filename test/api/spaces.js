const should = require('should');
// const Buildings = require('../../models/Buildings');
const Floors = require('../../models/Floors');
const Spaces = require('../../models/Spaces');
const Locations = require('../../models/Locations');
// const { Op } = require('sequelize');

describe('/api/spaces', () => {
	let space;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { name: '复旦软件园' } });
		this.floor = await Floors.findOne({ where: { locationId: this.location.id }, order: [ [ 'createdAt', 'DESC' ] ] });
	});

	it('新增spaces POST /api/spaces', (done) => {
		process.request
			.post('/api/spaces')
			.set('Authorization', process.token)
			.send({
				floorId: this.floor.id,
				name: 'Room1',
				area: 150,
				height: 3.1,
				spaceClassId: 20,
				groundId: 130,
				materialId: 25,
				wareNum: 5,
				description: 'description',
				isInner: true,
				isMaintained: false,
				status: 1
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				space = resData.data;
				should.equal(space.name, 'Room1');
				should.equal(space.locationId, this.floor.locationId);
				should.equal(space.buildingId, this.floor.buildingId);
				should.equal(space.floorId, this.floor.id);
				should.equal(space.area, 150);
				done();
			});
	});

	it('查询floor列表 GET /api/spaces?floorId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/spaces?floorId=${this.floor.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('查询space GET /api/spaces/:id', (done) => {
		process.request
			.get(`/api/spaces/${space.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				space = resData.data;
				should.equal(space.name, 'Room1');
				should.equal(space.locationId, this.floor.locationId);
				should.equal(space.buildingId, this.floor.buildingId);
				should.equal(space.floorId, this.floor.id);
				should.equal(space.area, 150);
				done();
			});
	});

	it('修改space PUT /api/spaces/:id', (done) => {
		process.request
			.put(`/api/spaces/${space.id}`)
			.set('Authorization', process.token)
			.send({
				name: 'Room2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Spaces.findOne({ where: { id: space.id } }).then((_space) => {
					should.equal(_space.name, 'Room2');
					done();
				});
			});
	});
});
