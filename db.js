const mysql = require("mysql");

const sql = mysql.createConnection({
	// Your credentials here
});

sql.connect();

module.exports = sql;
