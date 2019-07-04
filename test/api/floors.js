const should = require('should');
const Buildings = require('../../models/Buildings');
const Floors = require('../../models/Floors');

describe('/api/floors', () => {
	let floor;
	beforeEach(async () => {
		this.building = await Buildings.findOne({ where: { name: '复旦软件园' } });
	});

	it('查询floor列表 GET /api/floors?buildingId=limit=10&page=1', (done) => {
		process.request
			.get(`/api/floors?buildingId=${this.building.id}&limit=10&page=1`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增floors POST /api/floors', (done) => {
		Floors.destroy({
			where: {
				name: '1F',
				buildingId: this.building.id
			}
		}).then(() => {
			process.request
				.post('/api/floors')
				.set('Authorization', process.token)
				.send({
					name: '1F',
					buildingId: this.building.id
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					floor = resData.data;
					done();
				});
		}).catch(err => console.error(err));
	});

	it('查询floor GET /api/floors/:id', (done) => {
		process.request
			.get(`/api/floors/${floor.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '1F');
				done();
			});
	});

	it('修改floor PUT /api/floors/:id', (done) => {
		process.request
			.put(`/api/floors/${floor.id}`)
			.set('Authorization', process.token)
			.send({
				name: '2F'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Floors.findOne({ where: { id: floor.id } }).then((_floor) => {
					should.equal(_floor.name, '2F');
					done();
				});
			});
	});
});
