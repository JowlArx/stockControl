const express = require('express');
const { db } = require('../models/db');
const router = express.Router();

// Obtener todos los contratos
router.get('/', (req, res) => {
    const query = `SELECT * FROM contracts`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener contratos:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un contrato por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM contracts WHERE id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el contrato:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Contrato no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo contrato
router.post('/', (req, res) => {
    const { supplier_id, contract_details, start_date, end_date } = req.body;
    const query = `INSERT INTO contracts (supplier_id, contract_details, start_date, end_date) VALUES (?, ?, ?, ?)`;
    db.query(query, [supplier_id, contract_details, start_date, end_date], (err, result) => {
        if (err) {
            console.error('Error al crear el contrato:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Contrato creado exitosamente' });
    });
});

// Actualizar un contrato
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { supplier_id, contract_details, start_date, end_date } = req.body;
    const query = `UPDATE contracts SET supplier_id = ?, contract_details = ?, start_date = ?, end_date = ? WHERE id = ?`;
    db.query(query, [supplier_id, contract_details, start_date, end_date, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el contrato:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Contrato no encontrado');
        }
        res.status(200).send('Contrato actualizado exitosamente');
    });
});

// Eliminar un contrato
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM contracts WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el contrato:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Contrato no encontrado');
        }
        res.status(200).send('Contrato eliminado exitosamente');
    });
});

module.exports = router;