const should = require('should');
const Customers = require('../../models/Customers');
const Projects = require('../../models/Projects');

describe('/api/projects', () => {
	let customer;
	let project;
	beforeEach(async () => {
		customer = await Customers.findOne({ where: { mobile: '15618871298' } });
	});

	it('查询project列表 GET /api/projects?limit=10&page=1', (done) => {
		process.request
			.get('/api/projects?limit=10&page=1')
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.exist(res.body.data.count);
				should.exist(res.body.data.rows);
				done();
			});
	});

	it('新增projects POST /api/projects', (done) => {
		Projects.destroy({ where: { code: 'TEST0001' } }).then(() => {
			process.request
				.post('/api/projects')
				.set('Authorization', process.token)
				.send({
					customerId: customer.id,
					code: 'TEST0001',
					name: '测试项目',
					provinceCode: '110000',
					cityCode: '110100',
					districtCode: '110101',
					street: '三门路569弄',
					svs: [ { userId: '2541536342791141', userName: '李四' } ]
				})
				.expect(200)
				.end((err, res) => {
					should.not.exist(err);
					let resData = res.body;
					should.equal(resData.errcode, 0);
					project = resData.data;
					should.equal(project.customerId, customer.id);
					should.exist(project.customerName);
					should.equal(project.code, 'TEST0001');
					should.equal(project.name, '测试项目');
					should.equal(project.provinceCode, '110000');
					should.exist(project.provinceName);
					should.equal(project.cityCode, '110100');
					should.exist(project.cityName);
					should.equal(project.districtCode, '110101');
					should.exist(project.districtName);
					should.equal(project.street, '三门路569弄');
					should.exist(project.svs);
					should.equal(project.svs.length, 1);
					should.equal(project.svs[0].userId, '2541536342791141');
					should.equal(project.svs[0].userName, '李四');
					done();
				});
		});
	});

	it('查询project GET /api/projects/:id', (done) => {
		process.request
			.get(`/api/projects/${project.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				should.equal(res.body.data.name, '测试项目');
				done();
			});
	});

	it('修改project PUT /api/projects/:id', (done) => {
		process.request
			.put(`/api/projects/${project.id}`)
			.set('Authorization', process.token)
			.send({
				name: '测试项目2',
				street: '三门路2'
			})
			.expect(200)
			.end(async (err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);

				let _project = await Projects.findOne({ where: { id: project.id } });
				should.equal(_project.name, '测试项目2');
				should.equal(_project.street, '三门路2');
				done();
			});
	});
});
