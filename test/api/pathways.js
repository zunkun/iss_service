const should = require('should');
const Locations = require('../../models/Locations');
const Equipments = require('../../models/Equipments');
const Inspections = require('../../models/Inspections');
let pathway;
let pathway2;
let pathway3;
let equipment;
let ids = [];

describe('/api/pathways', () => {
	beforeEach(async () => {
		ids = [];
		this.location = await Locations.findOne({ where: { code: 'TEST0001', category: 2 } });
		this.equipments = await Equipments.findAll({ where: { locationId: this.location.id, category: 2 } });
		equipment = this.equipments[0];

		this.inspections = await Inspections.findAll({ where: { specId: equipment.specId } });
		for (let item of this.inspections) {
			ids.push(item.id);
		}
	});

	it('创建巡检路线 POST /api/pathways', (done) => {
		process.request
			.post('/api/pathways')
			.set('Authorization', process.token)
			.send({
				locationId: this.location.id,
				name: '3楼巡检路线',
				description: '3楼巡检路线说明',
				equipments: [ {
					id: equipment.id,
					inspections: ids
				} ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				pathway = res.body.data;
				console.log(pathway);
				should.exist(pathway.uuid);
				should.equal(pathway.name, '3楼巡检路线');
				should.equal(pathway.description, '3楼巡检路线说明');
				done();
			});
	});

	it('修改巡检路线 PUT /api/pathways', (done) => {
		process.request
			.put('/api/pathways')
			.set('Authorization', process.token)
			.send({
				uuid: pathway.uuid,
				name: '3楼巡检路线2',
				description: '3楼巡检路线说明',
				equipments: [ {
					id: equipment.id,
					inspections: ids
				} ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				console.log(res.body);
				should.equal(res.body.errcode, 0);
				pathway2 = res.body.data;
				should.exist(pathway2.uuid);
				should.equal(pathway2.uuid, pathway.uuid);
				should.equal(pathway2.name, '3楼巡检路线2');
				should.equal(pathway2.description, '3楼巡检路线说明');
				done();
			});
	});

	it('弃用巡检路线 POST /api/pathways/inuse', (done) => {
		process.request
			.post('/api/pathways/inuse')
			.set('Authorization', process.token)
			.send({
				uuid: pathway2.uuid,
				inuse: false
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				console.log(res.body);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('启用巡检路线 POST /api/pathways/inuse', (done) => {
		process.request
			.post('/api/pathways/inuse')
			.set('Authorization', process.token)
			.send({
				uuid: pathway2.uuid,
				inuse: true
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('复制巡检路线 POST /api/pathways/copy', (done) => {
		process.request
			.post('/api/pathways/copy')
			.set('Authorization', process.token)
			.send({
				uuid: pathway2.uuid
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				pathway3 = resData;
				should.exist(resData.uuid);
				should.notEqual(resData.uuid, pathway2.uuid);
				should.equal(resData.name, pathway2.name);
				should.equal(resData.description, pathway2.description);
				done();
			});
	});

	it('获取巡检路线详情 GET /api/pathways/:uuid', (done) => {
		process.request
			.get('/api/pathways/' + pathway3.uuid)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('获取巡检路线列表 GET /api/pathways?locationId=', (done) => {
		process.request
			.get('/api/pathways?locationId=' + this.location.id)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.exist(resData.count);
				should.exist(resData.rows);
				done();
			});
	});
});
