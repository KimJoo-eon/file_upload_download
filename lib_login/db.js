var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'test',
    port:3306
});
db.connect();

module.exports = db;