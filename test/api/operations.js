const should = require('should');
const Locations = require('../../models/Locations');
const Pathways = require('../../models/Pathways');

let equipment;
let inspections;
let operation;
describe('/api/operations', () => {
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', category: 2 }, raw: true });

		this.pathway = await Pathways.findOne({ where: { locationUuid: this.location.uuid, category: 1 }, raw: true });
		console.log(this.pathway);
	});

	it('创建巡检员巡检记录 POST /api/operations', (done) => {
		process.request
			.post('/api/operations')
			.set('Authorization', process.token)
			.send({
				pathwayUuid: this.pathway.uuid
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				operation = resData;
				should.exist(resData.id);
				should.exist(resData.locationUuid);
				should.exist(resData.locationId);
				should.exist(resData.pathwayUuid);
				should.exist(resData.pathwayName);
				should.exist(resData.date);
				should.exist(resData.startTime);
				done();
			});
	});

	it('扫描设备 POST /api/pathways/:uuid/scan', (done) => {
		process.request
			.post(`/api/pathways/${this.pathway.uuid}/scan`)
			.set('Authorization', process.token)
			.send({
				barcodeEntry: 'E00001'
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.equal(resData.inpathway, true);
				should.exist(resData.equipment);
				should.exist(resData.inspections);
				equipment = resData.equipment;
				inspections = resData.inspections;
				console.log(resData);
				done();
			});
	});

	it('扫描设备 POST /api/pathways/:uuid/scan', (done) => {
		process.request
			.post(`/api/pathways/${this.pathway.uuid}/scan`)
			.set('Authorization', process.token)
			.send({
				barcodeEntry: 'E00002'
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, -1);
				done();
			});
	});

	it('录入数据 POST /api/operations/inspect', (done) => {
		let insData = [];
		for (let inspection of inspections) {
			if (inspection.datatype === 1) {
				insData.push({
					id: inspection.id,
					state: 1
				});
			} else {
				insData.push({ id: inspection.id, value: 2 });
			}
		}
		process.request
			.post('/api/operations/inspect')
			.set('Authorization', process.token)
			.send({
				pathwayUuid: operation.pathwayUuid,
				equipmentId: equipment.id,
				inspections: insData
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				console.log(res.body);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('录入数据 POST /api/operations/inspect', (done) => {
		let insData = [];
		for (let inspection of inspections) {
			if (inspection.datatype === 1) {
				insData.push({
					id: inspection.id,
					state: 2
				});
			} else {
				insData.push({ id: inspection.id, value: 2 });
			}
		}
		process.request
			.post('/api/operations/inspect')
			.set('Authorization', process.token)
			.send({
				pathwayUuid: operation.pathwayUuid,
				equipmentId: equipment.id,
				inspections: insData
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('查看巡检信息 GET /api/operations/:id', (done) => {
		process.request
			.get('/api/operations/' + operation.id)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.exist(resData.operatepath);
				should.exist(resData.location);
				should.exist(resData.pathway);
				should.exist(resData.equipments);
				done();
			});
	});

	it('提交巡检 POST /api/operations/:id/commit', (done) => {
		process.request
			.post('/api/operations/' + operation.id + '/commit')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('设备巡检记录表 GET /api/operations/equipments', (done) => {
		process.request
			.get('/api/operations/equipments?norm=false&locationId=' + operation.locationId)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.equal(resData.count, 2);
				let row = resData.rows[0];
				should.exist(row.operatepath);
				should.exist(row.equipment);
				should.exist(row.operateInspections);
				done();
			});
	});
});
