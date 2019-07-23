const Pathways = require('../models/Pathways');
const moment = require('moment');
const OperatePaths = require('../models/OperatePaths');
const Personnels = require('../models/Personnels');

class PathOperations {
	async getOperatePath (options) {
		const { pathwayUuid, userId } = options;
		const date = moment().format('YYYY-MM-DD');
		try {
			let pathoperate = await OperatePaths.findOne({
				where: { pathwayUuid, category: 1, date, userId }
			});
			if (pathoperate) return pathoperate;

			let pathway = await Pathways.findOne({ pathwayUuid, category: 1 });
			let personnel = await Personnels.findOne({ where: { pathwayUuid, userId } });

			pathoperate = await OperatePaths.create({
				pathwayUuid,
				pathwayName: pathway.name,
				date,
				startTime: new Date(),
				accomplished: false,
				userId: userId,
				userName: personnel.userName,
				category: 1,
				pathwayId: pathway.id,
				personnelId: personnel.id
			});

			pathoperate.personnel = personnel;
			pathoperate.pathway = pathway;
			return pathoperate;
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

const operation = new PathOperations();

module.exports = operation;
