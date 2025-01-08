const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todos los registros de inventario (GET)
router.get('/', (req, res) => {
    const query = `
        SELECT i.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory i
        LEFT JOIN products p ON i.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un registro de inventario por ID (GET BY ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT i.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory i
        LEFT JOIN products p ON i.product_code = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE i.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el registro de inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Registro de inventario no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo registro de inventario (POST)
router.post('/', (req, res) => {
    const { product_code, stock_quantity, location } = req.body;

    if (!product_code || !stock_quantity || !location) {
        return res.status(400).send('Los campos "product_code", "stock_quantity" y "location" son obligatorios');
    }

    const query = `
        INSERT INTO inventory (product_code, stock_quantity, location, updated_at)
        VALUES (?, ?, ?, NOW())
    `;

    db.query(query, [product_code, stock_quantity, location], (err, result) => {
        if (err) {
            console.error('Error al crear el registro de inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Registro de inventario creado exitosamente' });
    });
});

// Actualizar un registro de inventario (PATCH)
router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { product_code, stock_quantity, location } = req.body;

    if (!product_code && !stock_quantity && !location) {
        return res.status(400).send('Al menos uno de los campos "product_code", "stock_quantity" o "location" debe ser proporcionado');
    }

    const fields = [];
    const values = [];

    if (product_code) {
        fields.push('product_code = ?');
        values.push(product_code);
    }
    if (stock_quantity) {
        fields.push('stock_quantity = ?');
        values.push(stock_quantity);
    }
    if (location) {
        fields.push('location = ?');
        values.push(location);
    }

    values.push(id);

    const query = `
        UPDATE inventory
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el registro de inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro de inventario no encontrado');
        }
        res.status(200).send('Registro de inventario actualizado exitosamente');
    });
});

// Eliminar un registro de inventario (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM inventory
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el registro de inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro de inventario no encontrado');
        }
        res.status(200).send('Registro de inventario eliminado exitosamente');
    });
});

module.exports = router;