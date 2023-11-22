const sql = require("./db");

function teamCompleted(teamName) {
	return new Promise((resolve, reject) => {
		const queryString = `call teamCompleted('system', '${teamName}');`;

		// Run your query
		sql.query(queryString, function (err, results) {
			if (err) {
				console.error("Error executing SQL query:", err);
				return reject(err);
			}

			// Extract plain JavaScript objects from RowDataPacket
			const temp = results[0];
			const rows = temp.map((row) => ({ ...row }));

			resolve(rows);
		});
	});
}

module.exports = teamCompleted;
