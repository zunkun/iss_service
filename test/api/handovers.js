const should = require('should');
const Handovers = require('../../models/Handovers');

describe('/api/handovers', () => {
	let handover;
	let handover2;
	let handover3;

	it('新增handovers POST /api/handovers', (done) => {
		process.request
			.post('/api/handovers')
			.set('Authorization', process.token)
			.send({
				toUserId: '36330717847922',
				fromGps: '上海市三门路561号',
				fromRemark: 'fromRemark',
				fromImages: [ 'a', 'b' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				handover = resData.data;
				should.exist(handover.fromUserId);
				should.exist(handover.fromUserName);
				should.exist(handover.date);
				should.equal(handover.toUserId, '36330717847922');
				should.equal(handover.fromGps, '上海市三门路561号');
				should.equal(handover.fromRemark, 'fromRemark');
				should.equal(handover.fromImages.length, 2);
				done();
			});
	});

	it('新增handovers POST /api/handovers', (done) => {
		process.request
			.post('/api/handovers')
			.set('Authorization', process.token)
			.send({
				toUserId: '4508346521365159',
				fromGps: '上海市三门路561号',
				fromRemark: 'fromRemark',
				fromImages: [ 'a', 'b' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				handover2 = resData.data;
				should.exist(handover.fromUserId);
				should.exist(handover2.fromUserName);
				should.exist(handover2.date);
				should.equal(handover2.toUserId, '4508346521365159');
				should.equal(handover2.fromGps, '上海市三门路561号');
				should.equal(handover2.fromRemark, 'fromRemark');
				should.equal(handover2.fromImages.length, 2);
				done();
			});
	});

	it('新增handovers POST /api/handovers', (done) => {
		process.request
			.post('/api/handovers')
			.set('Authorization', process.token)
			.send({
				toUserId: '4508346521365159',
				fromGps: '上海市三门路561号',
				fromRemark: 'fromRemark',
				fromImages: [ 'a', 'b' ]
			})
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				let resData = res.body;
				should.equal(resData.errcode, 0);
				handover3 = resData.data;
				should.exist(handover3.fromUserId);
				should.exist(handover3.fromUserName);
				should.exist(handover3.date);
				should.equal(handover3.toUserId, '4508346521365159');
				should.equal(handover3.fromGps, '上海市三门路561号');
				should.equal(handover3.fromRemark, 'fromRemark');
				should.equal(handover3.fromImages.length, 2);
				done();
			});
	});

	it('查询handover GET /api/handovers/:id', (done) => {
		process.request
			.get(`/api/handovers/${handover.id}`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);
				let _handover = res.body.data;

				should.equal(_handover.id, handover.id);
				done();
			});
	});

	it('撤销handover POST /api/handovers/:id/revoke', (done) => {
		process.request
			.post(`/api/handovers/${handover.id}/revoke`)
			.set('Authorization', process.token)
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);

				Handovers.findOne({ where: { id: handover.id } }).then(_handover => {
					should.equal(_handover.category, 3);
					done();
				});
			});
	});

	it('同意handover POST /api/handovers/:id/receiver', (done) => {
		process.request
			.post(`/api/handovers/${handover2.id}/receiver`)
			.set('Authorization', process.token)
			.send({ category: 2 })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				console.log(res.body);
				should.equal(res.body.errcode, 0);

				Handovers.findOne({ where: { id: handover2.id } }).then(_handover => {
					should.equal(_handover.category, 2);
					done();
				});
			});
	});

	it('拒绝handover POST /api/handovers/:id/receiver', (done) => {
		process.request
			.post(`/api/handovers/${handover3.id}/receiver`)
			.set('Authorization', process.token)
			.send({ category: 4 })
			.expect(200)
			.end((err, res) => {
				should.not.exist(err);
				should.equal(res.body.errcode, 0);

				Handovers.findOne({ where: { id: handover3.id } }).then(_handover => {
					should.equal(_handover.category, 4);
					done();
				});
			});
	});

	it('查询handover列表 GET /api/handovers?limit=10&page=1&userId=4508346521365159&fromto=1', (done) => {
		process.request
			.get('/api/handovers?limit=10&page=1')
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
