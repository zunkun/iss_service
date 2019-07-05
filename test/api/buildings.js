const should = require('should');
const Projects = require('../../models/Projects');
const Buildings = require('../../models/Buildings');

describe('/api/buildings', () => {
	let building;
	beforeEach(async () => {
		this.project = await Projects.findOne({ where: { code: 'TEST0001' } });
	});

	it('查询building列表 GET /api/buildings?projectId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/buildings?projectId=${this.project.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增buildings POST /api/buildings', (done) => {
		Buildings.destroy({
			where: {
				name: '上海复旦软件园',
				projectId: this.project.id
			}
		}).then(() => {
			process.request
				.post('/api/buildings')
				.set('Authorization', process.token)
				.send({
					name: '上海复旦软件园',
					projectId: this.project.id
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					building = resData.data;
					should.equal(building.name, '上海复旦软件园');
					should.equal(building.projectId, this.project.id);
					should.equal(building.projectName, this.project.name);
					done();
				});
		}).catch(err => console.error(err));
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
});
