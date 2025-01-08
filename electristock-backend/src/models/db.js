require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    charset: 'utf8mb4' // Asegúrate de que el charset sea compatible
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('ERROR AL CONECTAR CON LA DB:', err.message);
        return;
    }
    if (connection) connection.release();
    console.log('SE PUDO CONECTAR CON LA DB');
});

// Función para conectar a la base de datos
const connect = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) {
                console.error('ERROR AL CONECTAR CON LA DB', err.message);
                reject(err);
            } else {
                if (connection) connection.release();
                console.log('SE PUDO CONECTAR CON LA DB');
                resolve();
            }
        });
    });
};

// Función para desconectar de la base de datos
const disconnect = () => {
    return new Promise((resolve, reject) => {
        db.end((err) => {
            if (err) {
                console.error('ERROR AL DESCONECTAR DE LA DB', err.message);
                reject(err);
            } else {
                console.log('DESCONECTADO DE LA DB');
                resolve();
            }
        });
    });
};

module.exports = { db, connect, disconnect };