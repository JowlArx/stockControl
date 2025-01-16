const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const excel = require('exceljs');
const router = express.Router();
const { sendLowStockAlert } = require('../utils/alerts');

// Generar un reporte de inventario en Excel
router.get('/report/excel', async (req, res) => {
    const query = `
        SELECT i.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory i
        LEFT JOIN products p ON i.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error al obtener el inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Inventario');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Producto', key: 'product_name', width: 30 },
            { header: 'Código', key: 'product_code', width: 15 },
            { header: 'Descripción', key: 'description', width: 30 },
            { header: 'Categoría', key: 'category_name', width: 20 },
            { header: 'Proveedor', key: 'supplier_name', width: 20 },
            { header: 'Cantidad', key: 'stock_quantity', width: 10 },
            { header: 'Ubicación', key: 'location', width: 20 },
            { header: 'Actualizado', key: 'updated_at', width: 20 }
        ];

        results.forEach(item => {
            worksheet.addRow(item);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=inventario.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    });
});

// Obtener un registro de inventario por ID o product_code (GET BY ID OR P.CODE)
router.get('/search', (req, res) => {
    const { id, product_code } = req.query;

    if (!id && !product_code) {
        return res.status(400).send('Debe proporcionar "id" o "product_code" como parámetro de consulta');
    }

    let query = `
        SELECT i.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory i
        LEFT JOIN products p ON i.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;
    const values = [];

    if (id) {
        query += ' WHERE i.id = ?';
        values.push(id);
    } else if (product_code) {
        query += ' WHERE i.product_code = ?';
        values.push(product_code);
    }

    db.query(query, values, (err, results) => {
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

// Obtener todo el inventario (GET)
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

// Lista de productos con su cantidad actual (GET /inventory/stock-status)
router.get('/stockStatus', (req, res) => {
    const query = `
        SELECT p.name, i.stock_quantity
        FROM inventory i
        JOIN products p ON i.product_code = p.product_code
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el estado del stock:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Resumen del inventario (GET /inventory/summary)
router.get('/summary', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) AS total_products,
            SUM(stock_quantity) AS total_units,
            SUM(stock_quantity * p.price) AS total_value
        FROM inventory i
        JOIN products p ON i.product_code = p.product_code
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener el resumen del inventario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results[0]);
    });
});

// Obtener registros de inventario por ubicación (GET BY LOCATION)
router.get('/location/:location', (req, res) => {
    const { location } = req.params;

    const query = `
        SELECT i.*, p.name AS product_name, p.product_code, p.description, p.price, p.unit, c.name AS category_name, s.name AS supplier_name
        FROM inventory i
        LEFT JOIN products p ON i.product_code = p.product_code
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE i.location = ?
    `;

    db.query(query, [location], (err, results) => {
        if (err) {
            console.error('Error al obtener los registros de inventario por ubicación:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('No se encontraron registros de inventario para la ubicación especificada');
        }
        res.status(200).json(results);
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

        if (stock_quantity < 10) { // Umbral de stock bajo
            const productQuery = `SELECT name FROM products WHERE product_code = ?`;
            db.query(productQuery, [product_code], (err, results) => {
                if (err) {
                    console.error('Error al obtener el producto:', err);
                } else {
                    const product = results[0];
                    product.stock_quantity = stock_quantity;
                    sendLowStockAlert(product);
                }
            });
        }

        res.status(201).send({ id: result.insertId, message: 'Registro de inventario creado exitosamente' });
    });
});

// Actualizaciones masivas en el inventario (PATCH /inventory/update-massive)
router.patch('/updateMassive', (req, res) => {
    const updates = req.body; // Array de objetos { product_code, quantity }

    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).send('El cuerpo de la solicitud debe ser un array de actualizaciones');
    }

    const queries = updates.map(update => {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE inventory
                SET stock_quantity = stock_quantity + ?
                WHERE product_code = ?
            `;
            db.query(query, [update.quantity, update.product_code], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });

    Promise.all(queries)
        .then(results => {
            res.status(200).send('Actualizaciones masivas realizadas exitosamente');
        })
        .catch(err => {
            console.error('Error al realizar actualizaciones masivas:', err);
            res.status(500).send('Error interno del servidor');
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