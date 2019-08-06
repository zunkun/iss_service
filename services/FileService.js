const XLSX = require('xlsx');
const path = require('path');

class FileService {
	static parseExcel (filename) {
		console.log('【开始】解析excel文件');
		const filePath = path.join(__dirname, `../public/files/upload/${filename}`);

		try {
			let workbook = XLSX.readFile(filePath);
			const wsname = workbook.SheetNames[0];
			const ws = workbook.Sheets[wsname];
			return XLSX.utils.sheet_to_json(ws);
		} catch (error) {
			console.error('解析文件失败', error);
			return Promise.reject('考勤文件解析错误');
		};
	}
}
module.exports = FileService;
