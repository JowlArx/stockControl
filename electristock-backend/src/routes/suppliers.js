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

// Obtener un proveedor por ID o buscar proveedores por nombre o contacto (GET /suppliers/:id o GET /suppliers?name=&contact=)
router.get('/:id?', (req, res) => {
    const { id } = req.params;
    const { name, contact } = req.query;

    let query = `
        SELECT s.* 
        FROM suppliers s
        WHERE 1=1
    `;
    const params = [];

    if (id) {
        query += ' AND s.id = ?';
        params.push(id);
    }
    if (name) {
        query += ' AND s.name LIKE ?';
        params.push(`%${name}%`);
    }
    if (contact) {
        query += ' AND (s.contact_name LIKE ? OR s.contact_email LIKE ? OR s.contact_phone LIKE ?)';
        params.push(`%${contact}%`, `%${contact}%`, `%${contact}%`);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener proveedores:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (id && results.length === 0) {
            return res.status(404).send('Proveedor no encontrado');
        }
        res.status(200).json(id ? results[0] : results);
    });
});

// Lista todos los productos suministrados por un proveedor específico (GET /suppliers/products/:supplier_id)
router.get('/products/:supplier_id', (req, res) => {
    const { supplier_id } = req.params;

    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.supplier_id = ?
    `;

    db.query(query, [supplier_id], (err, results) => {
        if (err) {
            console.error('Error al obtener productos por proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
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