const mysql = require("mysql");

const sql = mysql.createConnection({
	// Your connection here
});

sql.connect();

module.exports = sql;
