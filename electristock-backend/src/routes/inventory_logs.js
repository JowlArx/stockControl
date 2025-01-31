const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();
const { sendInventoryChangeNotification } = require('../utils/notifications');
const { logAudit } = require('../utils/audit'); // Importa la función de auditoría

// Obtener todos los registros de logs
router.get('/', (req, res) => {
    const query = `SELECT * FROM inventory_logs`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Movimientos del inventario para un producto específico (GET /inventory_logs/by-product/:product_code)
router.get('/byproduct/', (req, res) => {
    const { product_code } = req.params;

    const query = `
        SELECT il.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory_logs il
        JOIN products p ON il.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE il.product_code = ?
    `;

    db.query(query, [product_code], (err, results) => {
        if (err) {
            console.error('Error al obtener los movimientos del inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});


// Filtrar logs por fecha, acción o cantidad (GET /inventory_logs/filter)
router.get('/filter', (req, res) => {
    const { start_date, end_date, action, min_quantity, max_quantity, page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = req.query;
    let query = `
        SELECT il.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory_logs il
        JOIN products p ON il.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE 1=1
    `;
    const params = [];

    if (start_date) {
        query += ' AND il.created_at >= ?';
        params.push(start_date);
    }
    if (end_date) {
        query += ' AND il.created_at <= ?';
        params.push(end_date);
    }
    if (action) {
        query += ' AND il.action = ?';
        params.push(action);
    }
    if (min_quantity) {
        query += ' AND il.quantity >= ?';
        params.push(min_quantity);
    }
    if (max_quantity) {
        query += ' AND il.quantity <= ?';
        params.push(max_quantity);
    }

    query += ` ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al filtrar logs de inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un registro de log por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT il.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory_logs il
        LEFT JOIN products p ON il.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE il.id = ?
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

// Crear un nuevo registro de log
router.post('/', async (req, res) => {
    const { product_code, quantity, action, reason } = req.body;

    if (!product_code || !quantity || !action || !reason) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = `
        INSERT INTO inventory_logs (product_code, quantity, action, reason, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(query, [product_code, quantity, action, reason], (err, result) => {
        if (err) {
            console.error('Error al crear el registro:', err);
            return res.status(500).send('Error interno del servidor');
        }

        const log = { product_code, quantity, action, reason };
        sendInventoryChangeNotification(log);

        res.status(201).send({ id: result.insertId, message: 'Registro creado exitosamente' });
    });
});

// Actualizar un registro de log
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { product_code, quantity, action, reason } = req.body;
    const query = `
        UPDATE inventory_logs
        SET product_code = ?, quantity = ?, action = ?, reason = ?
        WHERE id = ?
    `;

    db.query(query, [product_code, quantity, action, reason, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el registro:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro de inventario no encontrado');
        }
        res.status(200).send({ message: 'Registro actualizado exitosamente' });
    });
});

// Eliminar un registro de log
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM inventory_logs
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el registro:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro no encontrado');
        }
        res.status(200).send('Registro eliminado exitosamente');
    });
});

module.exports = router;