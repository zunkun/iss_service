const should = require('should');
const { Op } = require('sequelize');
const FC = require('../../models/FC');
describe('/api/fcs', () => {
	let fc;

	it('查询fcs列表 GET /api/fcs?projectId=limit=10&page=1', (done) => {
		process.request
			.get('/api/fcs?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增fcs POST /api/fcs', (done) => {
		FC.destroy({
			where: {
				name: {
					[Op.in]: [ '复旦空调', '复旦空调2' ]
				}
			}
		}).then(() => {
			process.request
				.post('/api/fcs')
				.set('Authorization', process.token)
				.send({
					name: '复旦空调',
					system: 1,
					description: '测试设备'
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					fc = resData.data;
					should.equal(fc.name, '复旦空调');
					should.equal(fc.system, 1);
					should.equal(fc.description, '测试设备');
					done();
				});
		}).catch(err => console.error(err));
	});

	it('查询fc GET /api/fcs/:id', (done) => {
		process.request
			.get(`/api/fcs/${fc.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '复旦空调');
				done();
			});
	});

	it('修改fc PUT /api/fcs/:id', (done) => {
		process.request
			.put(`/api/fcs/${fc.id}`)
			.set('Authorization', process.token)
			.send({
				name: '复旦空调2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				FC.findOne({ where: { id: fc.id } }).then((_fc) => {
					should.equal(_fc.name, '复旦空调2');
					done();
				});
			});
	});
});
