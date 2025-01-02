const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('ERROR AL CONECTAR CON LA DB', err.message);
        return;
    }
    if (connection) connection.release();
    console.log('SE PUDO CONECTAR CON LA DB');
});

module.exports = db;
