const sql = require("./db");

function getNextTeam(callback) {
	const queryString = `call getNextTeam()`;

	// Run your query
	sql.query(queryString, function (err, results) {
		if (err) {
			console.error("Error executing SQL query:", err);
			return callback(err, null);
		}

		// Extract plain JavaScript objects from RowDataPacket
		const temp = results[0];
		const rows = temp.map((row) => ({ ...row }));

		callback(null, rows);
	});
}

module.exports = getNextTeam;
