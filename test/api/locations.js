const should = require('should');
const Companies = require('../../models/Companies');
const Locations = require('../../models/Locations');

describe('/api/locations', () => {
	let company;
	let location;
	let location2;
	beforeEach(async () => {
		company = await Companies.findOne({ where: { mainphone: '15618871298' } });
	});

	it('新增locations POST /api/locations', (done) => {
		Locations.destroy({ where: { code: 'TEST0001' } }).then(() => {
			process.request
				.post('/api/locations')
				.set('Authorization', process.token)
				.send({
					companyId: company.id,
					code: 'TEST0001',
					name: '复旦软件园',
					provinceCode: '110000',
					cityCode: '110100',
					districtCode: '110101',
					street: '三门路569弄',
					commonName: 'commonName',
					costcenter: 'costcenter',
					areaUnitId: 1,
					currencyId: 2,
					geographyLookupId: 3,
					primaryUseId: 4,
					propertyClassId: 5,
					description: 'description',
					legalName: 'legalName',
					zippostal: 'zippostal',
					mainphone: '5618871298',
					parkingOpen: 20

				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					console.log(resData);
					should.equal(resData.errcode, 0);
					location = resData.data;
					should.equal(location.name, '复旦软件园');
					done();
				});
		});
	});

	it('新增locations POST /api/locations', (done) => {
		Locations.destroy({ where: { code: 'TEST0003' } }).then(() => {
			process.request
				.post('/api/locations')
				.set('Authorization', process.token)
				.send({
					companyId: company.id,
					code: 'TEST0003',
					name: '复旦软件园',
					provinceCode: '110000',
					cityCode: '110100',
					districtCode: '110101',
					street: '三门路569弄',
					commonName: 'commonName',
					costcenter: 'costcenter',
					areaUnitId: 1,
					currencyId: 2,
					geographyLookupId: 3,
					primaryUseId: 4,
					propertyClassId: 5,
					description: 'description',
					legalName: 'legalName',
					zippostal: 'zippostal',
					mainphone: '5618871298',
					parkingOpen: 20

				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					location2 = resData.data;
					should.equal(location.name, '复旦软件园');
					done();
				});
		});
	});

	it('查询location GET /api/locations/:id', (done) => {
		process.request
			.get(`/api/locations/${location.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '复旦软件园');
				done();
			});
	});

	it('修改location PUT /api/locations/:id', (done) => {
		process.request
			.put(`/api/locations/${location.id}`)
			.set('Authorization', process.token)
			.send({
				name: '复旦软件园2',
				street: '三门路2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				let _location = await Locations.findOne({ where: { id: location.id } });
				should.equal(_location.name, '复旦软件园2');
				should.equal(_location.street, '三门路2');
				done();
			});
	});

	it('查询location列表 GET /api/locations?limit=10&page=1', (done) => {
		process.request
			.get('/api/locations?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('删除location列表 DELETE /api/locations/:id', (done) => {
		process.request
			.get(`/api/locations/${location2.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});
});
