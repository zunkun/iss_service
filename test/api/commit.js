const should = require('should');
const Projects = require('../../models/Projects');

describe('/api/projects', () => {
	it('SV提交项目 POST /api/projects/:id/commit', (done) => {
		Projects.findOne({ where: { code: 'TEST0001' } }).then((project) => {
			process.request
				.post(`/api/projects/${project.id}/commit`)
				.set('Authorization', process.token)
				.send({	})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					console.log({ resData });
					done();
				});
		});
	});
});
