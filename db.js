const mysql = require("mysql");

const sql = mysql.createConnection({
	// Get from environment variables
});

sql.connect();

module.exports = sql;
