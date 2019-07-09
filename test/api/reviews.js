const should = require('should');
const Projects = require('../../models/Projects');

describe('/api/reviews', () => {
	it('SV提交项目 POST /api/reviews/commit', (done) => {
		Projects.findOne({ where: { code: 'TEST0001' } }).then((project) => {
			process.request
				.post('/api/reviews/commit')
				.set('Authorization', process.token)
				.send({ projectId: project.id })
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					done();
				});
		});
	});

	it('SV重复提交提交项目时有正在审核中的项目,错误返回 POST /api/reviews/commit', (done) => {
		Projects.findOne({ where: { code: 'TEST0001' } }).then((project) => {
			process.request
				.post('/api/reviews/commit')
				.set('Authorization', process.token)
				.send({	projectId: project.id })
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					should.notEqual(res.body.errcode, 0);
					done();
				});
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
				console.log({ resData });
				should.exist(resData.count);
				should.exist(resData.rows);
				done();
			});
	});
});
