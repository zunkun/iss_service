const should = require('should');
const Companies = require('../../models/Companies');
const Locations = require('../../models/Locations');

describe('/api/locations', () => {
	let company;
	let location;
	beforeEach(async () => {
		company = await Companies.findOne({ where: { name: '上海铭悦软件有限公司' } });
	});

	it('新增locations POST /api/locations', (done) => {
		Locations.destroy({ where: { name: '复旦软件园' } }).then(() => {
			process.request
				.post('/api/locations')
				.set('Authorization', process.token)
				.send({
					companyId: company.id,
					costcenter: 'TEST0001',
					name: '复旦软件园',
					provinceCode: '310000000000',
					cityCode: '310100000000',
					districtCode: '310113000000',
					street: '三门路569弄',
					propertyClassId: 5,
					description: 'description',
					zippostal: 'zippostal',
					mainphone: '5618871298',
					unit: 'unit',
					parkingOpen: 20,
					status: 1
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					location = resData.data;
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
				street: '三门路2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				let _location = await Locations.findOne({ where: { id: location.id } });
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
});
