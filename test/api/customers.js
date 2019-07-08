const should = require('should');
const Customers = require('../../models/Customers');

describe('/api/customers', () => {
	let customer;
	it('查询customer列表 GET /api/customers?limit=10&page=1', (done) => {
		process.request
			.get('/api/customers?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增customers POST /api/customers', (done) => {
		Customers.destroy({ where: { mobile: '15618871298' } }).then(() => {
			process.request
				.post('/api/customers')
				.set('Authorization', process.token)
				.send({
					industryCode: 1,
					email: 'liuzunkun@gmail.com',
					site: 'liuzunkun.com',
					mobile: '15618871298',
					name: '文恕公司'
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					customer = resData.data;
					done();
				});
		});
	});

	it('查询customer GET /api/customers/:id', (done) => {
		process.request
			.get(`/api/customers/${customer.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.mobile, 15618871298);
				done();
			});
	});

	it('修改customer PUT /api/customers/:id', (done) => {
		process.request
			.put(`/api/customers/${customer.id}`)
			.set('Authorization', process.token)
			.send({
				industryCode: 2,
				email: 'liuzunkun@gmail.com',
				site: 'liuzunkun.com',
				name: '文恕公司2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				let _customer = await Customers.findOne({ where: { id: customer.id } });
				should.equal(_customer.name, '文恕公司2');
				done();
			});
	});
});
