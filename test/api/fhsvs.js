const should = require('should');
const { Op } = require('sequelize');
const FC = require('../../models/FC');
const FHSV = require('../../models/FHSV');
const Spaces = require('../../models/Spaces');
describe('/api/fhsvs', () => {
	let fhsv;

	beforeEach(async () => {
		this.space = await Spaces.findOne({ where: { name: 'Room2' } });
		this.fc = await FC.findOne({ where: { name: '复旦空调2' } });
	});

	it('查询fhsvs列表 GET /api/fhsvs?code=&name=&system=&fcId=&projectId=&buildingId=&floorId=&spaceId=&limit=&page=&keywords=&status=', (done) => {
		process.request
			.get('/api/fhsvs?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增fhsvs POST /api/fhsvs', (done) => {
		FHSV.destroy({
			where: {
				name: {
					[Op.in]: [ '美的空调', '美的空调2' ]
				}
			}
		}).then(() => {
			process.request
				.post('/api/fhsvs')
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
					fhsv = resData.data;
					done();
				});
		}).catch(err => console.error(err));
	});

	it('查询fhsv GET /api/fhsvs/:id', (done) => {
		process.request
			.get(`/api/fhsvs/${fhsv.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '美的空调');
				should.exist(res.body.data.ihsvs);
				done();
			});
	});

	it('修改fhsv PUT /api/fhsvs/:id', (done) => {
		process.request
			.put(`/api/fhsvs/${fhsv.id}`)
			.set('Authorization', process.token)
			.send({
				name: '美的空调2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				FHSV.findOne({ where: { id: fhsv.id } }).then((_fhsv) => {
					should.equal(_fhsv.name, '美的空调2');
					done();
				});
			});
	});
});
