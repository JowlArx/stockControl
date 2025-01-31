const express = require('express');
const { db } = require('../models/db');
const excel = require('exceljs');
const router = express.Router();
const upload = require('../middleware/multer'); // Importa el middleware de multer
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authRole');
const { logAudit } = require('../utils/audit'); // Importa la función de auditoría

// Subir una imagen para un producto
router.post('/uploadImage/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const imageUrl = req.file.path;

    const query = `UPDATE products SET image_url = ? WHERE id = ?`;
    db.query(query, [imageUrl, id], (err, result) => {
        if (err) {
            console.error('Error al subir la imagen:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        logAudit(req.user.id, 'upload', 'product', id, 'Image uploaded - prouct id:' + id);
        res.status(200).send('Imagen subida exitosamente');
    });
});
// Obtener todos los productos (GET)
router.get('/', (req, res) => {
    const { page = 1, limit = 10, sort_by = 'id', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.* 
        FROM products p
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



// Obtener productos (GET BY ID / GET BY NAME / GET BY PRODUCT_CODE)
router.get('/by', (req, res) => {
    const { id, name, product_code, threshold, page = 1, limit = 10, sort_by = 'id', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name, i.stock_quantity
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN inventory i ON p.product_code = i.product_code
    `;
    const conditions = [];
    const params = [];

    if (id) {
        conditions.push('p.id = ?');
        params.push(id);
    }
    if (name) {
        conditions.push('p.name = ?');
        params.push(name);
    }
    if (product_code) {
        conditions.push('p.product_code = ?');
        params.push(product_code);
    }
    if (threshold) {
        conditions.push('i.stock_quantity <= ?');
        params.push(threshold);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (id || name || product_code) {
            if (results.length === 0) {
                return res.status(404).send('Producto no encontrado');
            }
            return res.status(200).json(results[0]);
        }
        res.status(200).json(results);
    });
});


// Obtener productos con stock por debajo de un umbral (GET LOW STOCK)
router.get('/lowstock', (req, res) => {
    const { threshold = 10, page = 1, limit = 10, sort_by = 'id', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.*, i.stock_quantity
        FROM products p
        JOIN inventory i ON p.product_code = i.product_code
        WHERE i.stock_quantity <= ?
        ORDER BY ${sort_by} ${order}
        LIMIT ? OFFSET ?
    `;

    db.query(query, [threshold, parseInt(limit), parseInt(offset)], (err, results) => {
        if (err) {
            console.error('Error al obtener productos con bajo stock:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Exportar productos como Excel (GET)
router.get('/export/excel', async (req, res) => {
    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Código', key: 'product_code', width: 15 },
            { header: 'Descripción', key: 'description', width: 30 },
            { header: 'Categoría', key: 'category_name', width: 20 },
            { header: 'Proveedor', key: 'supplier_name', width: 20 },
            { header: 'Precio', key: 'price', width: 10 },
            { header: 'Unidad', key: 'unit', width: 10 },
            { header: 'Creado', key: 'created_at', width: 20 },
            { header: 'Actualizado', key: 'updated_at', width: 20 }
        ];

        results.forEach(product => {
            worksheet.addRow(product);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=productos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
        logAudit(req.user.id, 'Exportado', 'products', 0, 'productos expotados (Excel)');
    });
});

//Exportar como SVG (GET)
router.get('/export/svg', async (req, res) => {
    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).send('Error interno del servidor');
        }

        // Importar dinámicamente los módulos ES
        const { createSVGWindow } = await import('svgdom');
        const { SVG, registerWindow } = await import('@svgdotjs/svg.js');

        const window = createSVGWindow();
        const document = window.document;
        registerWindow(window, document);

        const draw = SVG(document.documentElement);
        const svg = draw.size(1000, 500);

        results.forEach((product, index) => {
            svg.text(`${product.name} - ${product.category_name} - ${product.supplier_name}`)
                .move(10, 20 * (index + 1))
                .font({ size: 14 });
        });

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg.svg());
        logAudit(req.user.id, 'Exportado', 'products', 0000, 'productos exportados (SVG)');
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
        logAudit(req.user.id, 'create', 'product', result.insertId, 'Producto creado ' + name);
    });
});

// Actualizar un producto (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, product_code, description, category_id, supplier_id, price, unit } = req.body;

    if (!name || !product_code || !description || !category_id || !supplier_id || !price || !unit) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const checkQuery = `SELECT price FROM products WHERE id = ?`;
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        const oldPrice = results[0].price;

        const updateQuery = `
            UPDATE products
            SET name = ?, product_code = ?, description = ?, category_id = ?, supplier_id = ?, price = ?, unit = ?, updated_at = NOW()
            WHERE id = ?
        `;

        db.query(updateQuery, [name, product_code, description, category_id, supplier_id, price, unit, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar el producto:', err);
                return res.status(500).send('Error interno del servidor');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Producto no encontrado');
            }

            if (oldPrice !== price) {
                const insertPriceHistoryQuery = `
                    INSERT INTO price_history (product_id, old_price, new_price)
                    VALUES (?, ?, ?)
                `;
                db.query(insertPriceHistoryQuery, [id, oldPrice, price], (err) => {
                    if (err) {
                        console.error('Error al registrar el historial de precios:', err);
                    }
                });
            }

            res.status(200).send('Producto actualizado exitosamente');
            logAudit(req.user.id, 'updatebyid', 'product', id, 'Producto actualizado');
        });
    });
});

// Actualizar un producto por código de producto (PUT BY PRODUCT_CODE)
router.put('/code/:product_code', (req, res) => {
    const { product_code } = req.params;
    const { name, description, category_id, supplier_id, price, unit } = req.body;

    if (!name || !description || !category_id || !supplier_id || !price || !unit) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    const checkQuery = `SELECT price FROM products WHERE product_code = ?`;
    db.query(checkQuery, [product_code], (err, results) => {
        if (err) {
            console.error('Error al verificar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }

        const oldPrice = results[0].price;

        const updateQuery = `
            UPDATE products
            SET name = ?, description = ?, category_id = ?, supplier_id = ?, price = ?, unit = ?, updated_at = NOW()
            WHERE product_code = ?
        `;

        db.query(updateQuery, [name, description, category_id, supplier_id, price, unit, product_code], (err, result) => {
            if (err) {
                console.error('Error al actualizar el producto:', err);
                return res.status(500).send('Error interno del servidor');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Producto no encontrado');
            }

            if (oldPrice !== price) {
                const insertPriceHistoryQuery = `
                    INSERT INTO price_history (product_id, old_price, new_price)
                    VALUES ((SELECT id FROM products WHERE product_code = ?), ?, ?)
                `;
                db.query(insertPriceHistoryQuery, [product_code, oldPrice, price], (err) => {
                    if (err) {
                        console.error('Error al registrar el historial de precios:', err);
                    }
                });
            }

            res.status(200).send('Producto actualizado exitosamente');
            logAudit(req.user.id, 'updatebycode', 'product', product_code, 'Actualizacion de producto');
        });
    });
});

// Actualizar parcialmente un producto (PATCH)
router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    if (Object.keys(fields).length === 0) {
        return res.status(400).send('No hay campos para actualizar');
    }

    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    const query = `
        UPDATE products
        SET ${setClause}, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [...values, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.status(200).send('Producto actualizado parcialmente');
        logAudit(req.user.id, 'update parcial byid', 'product', id, 'actualizacion parcial de producto (id)');
    });
});

// Actualizar parcialmente un producto por código de producto (PATCH)   
router.patch('/code/:product_code', (req, res) => {
    const { product_code } = req.params;
    const fields = req.body;

    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    if (!setClause) {
        return res.status(400).send('No hay campos para actualizar');
    }

    const query = `
        UPDATE products
        SET ${setClause}, updated_at = NOW()
        WHERE product_code = ?
    `;

    db.query(query, [...values, product_code], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado');
        }
        res.status(200).send('Producto actualizado parcialmente');
        logAudit(req.user.id, 'update parcial bycode', 'product', product_code, 'actualizacion parcial de producto (product_code)');
    });
});


// Eliminar un producto (DELETE)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;

    const deletePriceHistoryQuery = `
        DELETE FROM price_history
        WHERE product_id = ?
    `;

    db.query(deletePriceHistoryQuery, [id], (err, result) => {
        const audID = id;
        if (err) {
            console.error('Error al eliminar el historial de precios:', err);
            return res.status(500).send('Error interno del servidor');
        }

        const deleteInventoryLogsQuery = `
            DELETE FROM inventory_logs
            WHERE product_code = (SELECT product_code FROM products WHERE id = ?)
        `;

        db.query(deleteInventoryLogsQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar los logs de inventario:', err);
                return res.status(500).send('Error interno del servidor');
            }

            const deleteInventoryQuery = `
                DELETE FROM inventory
                WHERE product_code = (SELECT product_code FROM products WHERE id = ?)
            `;

            db.query(deleteInventoryQuery, [id], (err, result) => {
                if (err) {
                    console.error('Error al eliminar el inventario:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                const deleteProductQuery = `
                    DELETE FROM products
                    WHERE id = ?
                `;

                db.query(deleteProductQuery, [id], (err, result) => {
                    if (err) {
                        console.error('Error al eliminar el producto:', err);
                        return res.status(500).send('Error interno del servidor');
                    }
                    if (result.affectedRows === 0) {
                        return res.status(404).send('Producto no encontrado');
                    }
                    res.status(200).send('Producto eliminado exitosamente');
                    logAudit(req.user.id, 'delete', 'product', audID, 'Producto eliminado');
                });
            });
        });
    });
});

module.exports = router;