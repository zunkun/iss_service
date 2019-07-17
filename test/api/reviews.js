const should = require('should');
const Locations = require('../../models/Locations');
let reviewId;
let reviewId2;

describe('/api/reviews', () => {
	beforeEach(async () => {
		this.location = await Locations.findOne({ where: { code: 'TEST0001', category: 0 } });
	});
	it('SV提交项目 POST /api/reviews/commit', (done) => {
		process.request
			.post('/api/reviews/commit')
			.set('Authorization', process.token)
			.send({ locationId: this.location.id })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('SV重复提交提交项目时有正在审核中的项目,错误返回 POST /api/reviews/commit', (done) => {
		process.request
			.post('/api/reviews/commit')
			.set('Authorization', process.token)
			.send({	locationId: this.location.id })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.notEqual(res.body.errcode, 0);
				done();
			});
	});

	it('获取审核信息列表 GET /api/reviews', (done) => {
		process.request
			.get('/api/reviews?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.exist(resData.count);
				should.exist(resData.rows);
				reviewId = resData.rows[0].id;
				done();
			});
	});

	it('获取审批单详情 GET /api/reviews/:id', (done) => {
		process.request
			.get('/api/reviews/' + reviewId)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let resData = res.body.data;
				should.equal(resData.id, reviewId);
				should.exist(resData.company);
				should.exist(resData.location);
				done();
			});
	});

	it('审批通过 POST /api/reviews/status', (done) => {
		process.request
			.post('/api/reviews/status')
			.set('Authorization', process.token)
			.send({	reviewId, status: 1 })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	it('SV提交项目 POST /api/reviews/commit', (done) => {
		process.request
			.post('/api/reviews/commit')
			.set('Authorization', process.token)
			.send({ locationId: this.location.id })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				done();
			});
	});

	// it('审批拒绝 POST /api/reviews/status', (done) => {
	// 	process.request
	// 		.post('/api/reviews/status')
	// 		.set('Authorization', process.token)
	// 		.send({	reviewId, status: 2 })
	// 		.expect(200)
	// 		.end((err, res) => {
	// 			should.not.exist(err);
	// 			should.equal(res.body.errcode, 0);
	// 			done();
	// 		});
	// });
});
