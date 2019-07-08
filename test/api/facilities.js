const should = require('should');
const { Op } = require('sequelize');
const FC = require('../../models/FC');
const Facilities = require('../../models/Facilities');
const Spaces = require('../../models/Spaces');
describe('/api/facilities', () => {
	let facility;

	beforeEach(async () => {
		this.space = await Spaces.findOne({ where: { name: 'Room2' } });
		this.fc = await FC.findOne({ where: { name: '复旦空调2' } });
	});

	it('查询facilities列表 GET /api/facilities?code=&name=&system=&fcId=&projectId=&buildingId=&floorId=&spaceId=&limit=&page=&keywords=&status=', (done) => {
		process.request
			.get('/api/facilities?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增facilities POST /api/facilities', (done) => {
		Facilities.destroy({
			where: {
				name: {
					[Op.in]: [ '美的空调', '美的空调2' ]
				}
			}
		}).then(() => {
			process.request
				.post('/api/facilities')
				.set('Authorization', process.token)
				.send({
					code: 'F0001',
					name: '美的空调',
					fcId: this.fc.id,
					spaceId: this.space.id,
					inspect: true
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					facility = resData.data;
					done();
				});
		}).catch(err => console.error(err));
	});

	it('查询facility GET /api/facilities/:id', (done) => {
		process.request
			.get(`/api/facilities/${facility.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);

				should.equal(res.body.data.name, '美的空调');
				should.exist(res.body.data.fis);
				done();
			});
	});

	it('修改facility PUT /api/facilities/:id', (done) => {
		process.request
			.put(`/api/facilities/${facility.id}`)
			.set('Authorization', process.token)
			.send({
				name: '美的空调2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				Facilities.findOne({ where: { id: facility.id } }).then((_facility) => {
					should.equal(_facility.name, '美的空调2');
					done();
				});
			});
	});
});
