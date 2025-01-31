const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();
const authenticateToken = require('../middleware/auth'); // Importa el middleware de autenticación
const authorizeRole = require('../middleware/authRole'); // Importa el middleware de autorización
const { logAudit } = require('../utils/audit'); // Importa la función de auditoría


// Obtener todas las categorías (GET)
router.get('/', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
    const { page = 1, limit = 10, sort_by = 'id', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT c.* 
        FROM categories c
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
    `;

    db.query(query, [parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) {
            console.error('Error al obtener categorías:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener una categoría por id (GET BY ID)
router.get('/:id', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT c.* 
        FROM categories c
        WHERE c.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el proveedor:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Categoria no encontrada');
        }
        res.status(200).json(results[0]);
    });
});

// Crear una nueva categoría (POST)
router.post('/', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('El nombre de la categoría es obligatorio');
    }

    const query = `
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `;

    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error al crear la categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Categoría creada exitosamente' });
        logAudit(req.user.id, 'Create', 'category', result.insertId, 'Categoria creada: ' + name);
    });
});

// Actualizar una categoría (PUT)
router.put('/:id', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('El campo "name" es obligatorio');
    }

    const query = `
        UPDATE categories
        SET name = ?, description = ?
        WHERE id = ?
    `;

    db.query(query, [name, description, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Categoría no encontrada');
        }
        res.status(200).send('Categoría actualizada exitosamente');
        logAudit(req.user.id, 'Update', 'category', id, 'Categoria actualizada: ' + name);
    });
});

// Eliminar una categoría (DELETE)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM categories
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Categoría no encontrada');
        }
        res.status(200).send('Categoría eliminada exitosamente');
        logAudit(req.user.id, 'Delete', 'category', id, 'Categoria eliminada');

    });
});

// Devuelve los productos asociados a una categoría específica (GET /categories/products/:category_id)
router.get('/products/:category_id', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
    const { category_id } = req.params;
    const { page = 1, limit = 10, sort_by = 'id', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.category_id = ?
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
    `;

    db.query(query, [category_id, parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) {
            console.error('Error al obtener productos por categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

module.exports = router;