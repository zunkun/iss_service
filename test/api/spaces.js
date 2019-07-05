const should = require('should');
const Buildings = require('../../models/Buildings');
const Floors = require('../../models/Floors');
const Spaces = require('../../models/Spaces');
const Projects = require('../../models/Projects');

describe('/api/spaces', () => {
	let space;
	beforeEach(async () => {
		this.project = await Projects.findOne({ where: { code: 'TEST0001' } });
		this.building = await Buildings.findOne({ where: { name: '复旦软件园', projectId: this.project.id } });
		this.floor = await Floors.findOne({ where: { buildingId: this.building.id, name: '2F' } });
	});

	it('查询floor列表 GET /api/spaces?floorId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/spaces?floorId=${this.floor.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增spaces POST /api/spaces', (done) => {
		Spaces.destroy({
			where: {
				name: 'Room1',
				floorId: this.floor.id
			}
		}).then(() => {
			process.request
				.post('/api/spaces')
				.set('Authorization', process.token)
				.send({
					name: 'Room1',
					floorId: this.floor.id
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					space = resData.data;
					should.equal(space.name, 'Room1');
					should.equal(space.projectId, this.floor.projectId);
					should.equal(space.projectName, this.floor.projectName);
					should.equal(space.buildingId, this.floor.buildingId);
					should.equal(space.buildingName, this.floor.buildingName);
					should.equal(space.floorId, this.floor.id);
					should.equal(space.floorName, this.floor.name);
					done();
				});
		}).catch(err => console.error(err));
	});

	it('查询space GET /api/spaces/:id', (done) => {
		process.request
			.get(`/api/spaces/${space.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, 'Room1');
				done();
			});
	});

	it('修改space PUT /api/spaces/:id', (done) => {
		process.request
			.put(`/api/spaces/${space.id}`)
			.set('Authorization', process.token)
			.send({
				name: 'Room2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Spaces.findOne({ where: { id: space.id } }).then((_space) => {
					should.equal(_space.name, 'Room2');
					done();
				});
			});
	});
});
