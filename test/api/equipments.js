const should = require('should');
const Spaces = require('../../models/Spaces');
const Locations = require('../../models/Locations');
const Specs = require('../../models/Specs');
const Equipments = require('../../models/Equipments');

describe('/api/equipments', () => {
	let equipment;
	let equipment2;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', category: 0 } });
		this.space = await Spaces.findOne({ where: { locationId: this.location.id, category: 0 } });
		this.spec = await Specs.findOne({ where: { name: '格力空调2' } });
	});

	it('新增equipments POST /api/equipments', (done) => {
		process.request
			.post('/api/equipments')
			.set('Authorization', process.token)
			.send({
				spaceId: this.space.id,
				specId: this.spec.id,
				name: '格力空调2019',
				barcodeEntry: 'E00001',
				description: 'description',
				conditionId: 20,
				grpassetcriticalityId: 130,
				nameplate: 'nameplate',
				power: '200W',
				quantity: 1,
				remarks: 'remarks',
				serialNum: 'serialNum',
				inspect: true
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				equipment = resData.data;
				should.equal(equipment.locationId, this.space.locationId);
				should.equal(equipment.buildingId, this.space.buildingId);
				should.equal(equipment.floorId, this.space.floorId);
				should.equal(equipment.spaceId, this.space.id);
				should.equal(equipment.spaceId, this.space.id);
				should.equal(equipment.specId, this.spec.id);
				should.equal(equipment.name, '格力空调2019');
				should.equal(equipment.barcodeEntry, 'E00001');
				should.equal(equipment.description, 'description');
				should.equal(equipment.conditionId, 20);
				should.equal(equipment.grpassetcriticalityId, 130);
				should.equal(equipment.nameplate, 'nameplate');
				should.equal(equipment.power, '200W');
				should.equal(equipment.quantity, 1);
				should.equal(equipment.remarks, 'remarks');
				should.equal(equipment.serialNum, 'serialNum');
				should.equal(equipment.inspect, true);
				done();
			});
	});

	it('新增equipments POST /api/equipments', (done) => {
		process.request
			.post('/api/equipments')
			.set('Authorization', process.token)
			.send({
				spaceId: this.space.id,
				specId: this.spec.id,
				name: '格力空调2020',
				barcodeEntry: 'E00002',
				description: 'description',
				conditionId: 20,
				grpassetcriticalityId: 130,
				nameplate: 'nameplate',
				power: '200W',
				quantity: 1,
				remarks: 'remarks',
				serialNum: 'serialNum',
				parentAssetId: equipment.id,
				inspect: true
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				equipment2 = resData.data;
				should.equal(equipment2.locationId, this.space.locationId);
				should.equal(equipment2.buildingId, this.space.buildingId);
				should.equal(equipment2.floorId, this.space.floorId);
				should.equal(equipment2.spaceId, this.space.id);
				should.equal(equipment2.spaceId, this.space.id);
				should.equal(equipment2.specId, this.spec.id);
				should.equal(equipment2.name, '格力空调2020');
				should.equal(equipment2.barcodeEntry, 'E00002');
				should.equal(equipment2.description, 'description');
				should.equal(equipment2.conditionId, 20);
				should.equal(equipment2.grpassetcriticalityId, 130);
				should.equal(equipment2.nameplate, 'nameplate');
				should.equal(equipment2.power, '200W');
				should.equal(equipment2.quantity, 1);
				should.equal(equipment2.remarks, 'remarks');
				should.equal(equipment2.serialNum, 'serialNum');
				should.equal(equipment2.inspect, true);
				done();
			});
	});

	it('查询floor列表 GET /api/equipments?spaceId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/equipments?spaceId=${this.space.id}&limit=10&page=1&keywords=`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('查询equipment GET /api/equipments/:id', (done) => {
		process.request
			.get(`/api/equipments/${equipment.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				equipment = resData.data;
				should.equal(equipment.locationId, this.space.locationId);
				should.equal(equipment.buildingId, this.space.buildingId);
				should.equal(equipment.floorId, this.space.floorId);
				should.equal(equipment.spaceId, this.space.id);
				should.equal(equipment.spaceId, this.space.id);
				should.equal(equipment.specId, this.spec.id);
				should.equal(equipment.name, '格力空调2019');
				should.equal(equipment.barcodeEntry, 'E00001');
				should.equal(equipment.description, 'description');
				should.equal(equipment.conditionId, 20);
				should.equal(equipment.grpassetcriticalityId, 130);
				should.equal(equipment.nameplate, 'nameplate');
				should.equal(equipment.power, '200W');
				should.equal(equipment.quantity, 1);
				should.equal(equipment.remarks, 'remarks');
				should.equal(equipment.serialNum, 'serialNum');
				should.equal(equipment.inspect, true);
				done();
			});
	});

	it('修改equipment PUT /api/equipments/:id', (done) => {
		process.request
			.put(`/api/equipments/${equipment2.id}`)
			.set('Authorization', process.token)
			.send({
				name: '格力空调2022',
				inspect: false
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Equipments.findOne({ where: { id: equipment2.id } }).then((_equipment) => {
					should.equal(_equipment.name, '格力空调2022');
					should.equal(_equipment.inspect, false);
					done();
				});
			});
	});

	it('删除equipment PUT /api/equipments/:id', (done) => {
		process.request
			.delete(`/api/equipments/${equipment2.id}`)
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
