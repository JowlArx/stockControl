const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todos los productos (GET)
router.get('/', (req, res) => {
    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un producto por ID (GET BY ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo producto (POST)
router.post('/', (req, res) => {
    const { name, product_code, description, category_id, supplier_id, price, unit } = req.body;

    if (!name || !price || !unit) {
        return res.status(400).send('Los campos "name", "price" y "unit" son obligatorios');
    }

    const query = `
        INSERT INTO products (name, product_code, description, category_id, supplier_id, price, unit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(query, [name, product_code, description, category_id, supplier_id, price, unit], (err, result) => {
        if (err) {
            console.error('Error al crear el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Producto creado exitosamente' });
    });
});

// Actualizar un producto (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, product_code, description, category_id, supplier_id, price, unit } = req.body;

    if (!name || !product_code || !price || !unit) {
        return res.status(400).send('Los campos "name", "product_code", "price" y "unit" son obligatorios');
    }

    const query = `
        UPDATE products
        SET name = ?, product_code = ?, description = ?, category_id = ?, supplier_id = ?, price = ?, unit = ?, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [name, product_code, description, category_id, supplier_id, price, unit, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.status(200).send('Producto actualizado exitosamente');
    });
});

// Eliminar un producto (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM products
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.status(200).send('Producto eliminado exitosamente');
    });
});

module.exports = router;