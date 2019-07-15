const should = require('should');
const Locations = require('../../models/Locations');

describe('/api/personnels', () => {
	let location;
	beforeEach(async () => {
		location = await Locations.findOne({ where: { code: 'TEST0001' } });
	});

	it('新增personnels manager角色 POST /api/personnels', (done) => {
		process.request
			.post('/api/personnels')
			.set('Authorization', process.token)
			.send({
				locationId: location.id,
				role: 3,
				userIds: [ '15538231495541693', '131148124326279365' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				should.equal(res.body.data.length, 2);
				done();
			});
	});

	it('新增personnels -sv角色 POST /api/personnels', (done) => {
		process.request
			.post('/api/personnels')
			.set('Authorization', process.token)
			.send({
				locationId: location.id,
				role: 2,
				userIds: [ '280441575021784807', '16311461461143016', '4508346521365159' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				should.equal(res.body.data.length, 3);
				done();
			});
	});

	it('新增personnels巡检员 POST /api/personnels', (done) => {
		process.request
			.post('/api/personnels')
			.set('Authorization', process.token)
			.send({
				locationId: location.id,
				role: 1,
				userIds: [ '15601316486043132', '0306353825780096' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				should.equal(res.body.data.length, 2);
				done();
			});
	});

	it('查询personnel列表 GET /api/personnels?locationId=', (done) => {
		process.request
			.get(`/api/personnels?locationId=${location.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exists(res.body.data.length);
				done();
			});
	});

	it('查询用户在项目点中角色 GET /api/personnels/role', (done) => {
		process.request
			.get(`/api/personnels/role?locationId=${location.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				console.log(res.body);
				should.equal(res.body.errcode, 0);
				should.exist(res.body.data.length);
				done();
			});
	});
});
