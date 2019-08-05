const should = require('should');
// const Buildings = require('../../models/Buildings');
const Floors = require('../../models/Floors');
const Spaces = require('../../models/Spaces');
const Locations = require('../../models/Locations');
// const { Op } = require('sequelize');

describe('/api/spaces', () => {
	let space;
	let space2;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', status: 0 } });
		this.floor = await Floors.findOne({ where: { locationId: this.location.id } });
	});

	it('新增spaces POST /api/spaces', (done) => {
		process.request
			.post('/api/spaces')
			.set('Authorization', process.token)
			.send({
				floorId: this.floor.id,
				name: 'Room1',
				barcodeentry: 'S0001',
				area: 150,
				extwindowarea: 20,
				inwindowarea: 130,
				spaceheight: 3.13
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
				should.equal(space.barcodeentry, 'S0001');
				should.equal(space.area, 150);
				should.equal(space.extwindowarea, 20);
				should.equal(space.inwindowarea, 130);
				should.equal(space.spaceheight, 3.13);
				done();
			});
	});

	it('新增spaces POST /api/spaces', (done) => {
		process.request
			.post('/api/spaces')
			.set('Authorization', process.token)
			.send({
				floorId: this.floor.id,
				name: 'Room3',
				barcodeentry: 'S0003',
				area: 150,
				extwindowarea: 20,
				inwindowarea: 130,
				spaceheight: 3.13
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				space2 = resData.data;
				should.equal(space2.name, 'Room3');
				should.equal(space2.locationId, this.floor.locationId);
				should.equal(space2.buildingId, this.floor.buildingId);
				should.equal(space2.floorId, this.floor.id);
				should.equal(space2.barcodeentry, 'S0003');
				should.equal(space2.area, 150);
				should.equal(space2.extwindowarea, 20);
				should.equal(space2.inwindowarea, 130);
				should.equal(space2.spaceheight, 3.13);
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
				should.equal(space.barcodeentry, 'S0001');
				should.equal(space.area, 150);
				should.equal(space.extwindowarea, 20);
				should.equal(space.inwindowarea, 130);
				should.equal(space.spaceheight, 3.13);
				should.equal(res.body.errcode, 0);
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

	it('删除space PUT /api/spaces/:id', (done) => {
		process.request
			.delete(`/api/spaces/${space2.id}`)
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
