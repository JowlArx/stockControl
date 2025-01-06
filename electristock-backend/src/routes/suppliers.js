const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todos los proveedores (GET)
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

// Obtener un proveedor por ID (GET BY ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT s.* 
        FROM suppliers s
        WHERE s.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Proveedor no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo proveedor (POST)
router.post('/', (req, res) => {
    const { name, contact_name, contact_email, contact_phone, address } = req.body;

    if (!name || !contact_phone || !contact_email) {
        return res.status(400).send('Los campos "nombre", "telefono de contacto" y "e-mail" son obligatorios');
    }

    const query = `
        INSERT INTO suppliers (name, contact_name, contact_email, contact_phone, address)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [name, contact_name, contact_email, contact_phone, address], (err, result) => {
        if (err) {
            console.error('Error al cargar el proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Proveedor cargado exitosamente' });
    });
});

// Actualizar un proveedor (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact_name, contact_email, contact_phone, address } = req.body;

    if (!name || !contact_phone || !contact_email) {
        return res.status(400).send('Los campos "nombre", "telefono de contacto" y "e-mail" son obligatorios');
    }

    const query = `
        UPDATE suppliers 
        SET name = ?, contact_name = ?, contact_email = ?, contact_phone = ?, address = ?
        WHERE id = ?
    `;

    db.query(query, [name, contact_name, contact_email, contact_phone, address, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Proveedor no encontrado');
        }
        res.status(200).send('Proveedor actualizado exitosamente');
    });
});

// Eliminar un proveedor (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM suppliers
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Proveedor no encontrado');
        }
        res.status(200).send('Proveedor eliminado exitosamente');
    });
});

module.exports = router;