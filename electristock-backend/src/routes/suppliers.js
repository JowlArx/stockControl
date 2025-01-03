const express = require('express');
const db = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

router.get('/', (req, res) => {
    const query = `
        SELECT s.* 
        FROM suppliers s
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener categorías:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

module.exports = router;