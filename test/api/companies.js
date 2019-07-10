const should = require('should');
const Company = require('../../models/Company');

describe('/api/companies', () => {
	let company;

	it('新增companys POST /api/companies', (done) => {
		Company.destroy({ where: { mainphone: '15618871298' } }).then(() => {
			process.request
				.post('/api/companies')
				.set('Authorization', process.token)
				.send({
					name: '上海铭悦软件有限公司',
					costcenter: '成本中心',
					address: '上海市三门路561号',
					apcompanycode: 'T20190710',
					email: 'liuzunkun@gmail.com',
					mainfax: 'fax@liuzunkun.com',
					mainphone: '15618871298',
					shortname: '铭悦软件',
					zippostal: '200000',
					site: 'liuzunkun.com',
					industryCode: 1
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					company = resData.data;
					done();
				});
		});
	});

	it('查询company GET /api/companies/:id', (done) => {
		process.request
			.get(`/api/companies/${company.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.mainphone, 15618871298);
				done();
			});
	});

	it('修改company PUT /api/companies/:id', (done) => {
		process.request
			.put(`/api/companies/${company.id}`)
			.set('Authorization', process.token)
			.send({
				name: '上海铭悦软件有限公司',
				costcenter: '成本中心2',
				address: '上海市三门路561号',
				apcompanycode: 'T20190710',
				email: 'liuzunkun@gmail.com',
				mainfax: 'fax@liuzunkun.com',
				mainphone: '15618871298',
				shortname: '铭悦软件',
				zippostal: '200000',
				site: 'liuzunkun.com',
				industryCode: 2
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				let _company = await Company.findOne({ where: { id: company.id } });
				should.equal(_company.name, '上海铭悦软件有限公司');
				done();
			});
	});

	it('查询company列表 GET /api/companies?limit=10&page=1', (done) => {
		process.request
			.get('/api/companies?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});
});
