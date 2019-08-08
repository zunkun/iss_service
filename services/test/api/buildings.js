const should = require('should');
const Locations = require('../../models/Locations');
const Buildings = require('../../models/Buildings');

describe('/api/buildings', () => {
	let building;
	let building2;
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', status: 0 } });
	});

	it('新增buildings POST /api/buildings', (done) => {
		process.request
			.post('/api/buildings')
			.set('Authorization', process.token)
			.send({
				locationId: this.location.id,
				name: '上海复旦软件园',
				buildingClassId: 20,
				activeStartDate: '2019-07-15',
				address: '上海复旦软件园',
				commonName: '复旦软件园',
				costcenter: '成本中心',
				description: '描述',
				legalName: '法律名称',
				mainfax: 'mainfax',
				mainphone: 'mainphone',
				parkingOpen: 30,
				primaryUseId: 22
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				building = resData.data;
				should.equal(building.name, '上海复旦软件园');
				should.equal(building.locationId, this.location.id);
				should.equal(building.buildingClassId, 20);
				should.exist(building.buildingClass);
				should.equal(building.primaryUseId, 22);
				should.exist(building.primaryUse);
				should.equal(building.activeStartDate, '2019-07-15');
				should.equal(building.address, '上海复旦软件园');
				should.equal(building.commonName, '复旦软件园');
				should.equal(building.costcenter, '成本中心');
				should.equal(building.description, '描述');
				should.equal(building.legalName, '法律名称');
				should.equal(building.mainfax, 'mainfax');
				should.equal(building.parkingOpen, 30);
				done();
			});
	});

	it('新增buildings POST /api/buildings', (done) => {
		process.request
			.post('/api/buildings')
			.set('Authorization', process.token)
			.send({
				locationId: this.location.id,
				name: '上海复旦软件园2',
				buildingClassId: 20,
				activeStartDate: '2019-07-15',
				address: '上海复旦软件园2',
				commonName: '复旦软件园2',
				costcenter: '成本中心',
				description: '描述',
				legalName: '法律名称',
				mainfax: 'mainfax',
				mainphone: 'mainphone',
				parkingOpen: 30,
				primaryUseId: 22
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				building2 = resData.data;
				should.equal(building2.name, '上海复旦软件园2');
				should.equal(building2.locationId, this.location.id);
				should.equal(building2.buildingClassId, 20);
				should.exist(building2.buildingClass);
				should.equal(building2.primaryUseId, 22);
				should.exist(building2.primaryUse);
				should.equal(building2.activeStartDate, '2019-07-15');
				should.equal(building2.address, '上海复旦软件园2');
				should.equal(building2.commonName, '复旦软件园2');
				should.equal(building2.costcenter, '成本中心');
				should.equal(building2.description, '描述');
				should.equal(building2.legalName, '法律名称');
				should.equal(building2.mainfax, 'mainfax');
				should.equal(building2.parkingOpen, 30);
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
				should.equal(res.body.data.name, '上海复旦软件园');
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

	it('删除building delete /api/buildings/:id', (done) => {
		process.request
			.delete(`/api/buildings/${building.id}`)
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
