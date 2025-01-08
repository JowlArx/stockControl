const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const excel = require('exceljs');
const { createSVGWindow } = require('svgdom');
const { SVG, registerWindow } = require('@svgdotjs/svg.js');
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

// Obtener productos por categoría (GET BY CATEGORY)
router.get('/:id/products', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT p.* 
        FROM products p
        WHERE p.category_id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener productos por categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener productos con stock por debajo de un umbral (GET LOW STOCK)
router.get('/low-stock/:threshold', (req, res) => {
    const { threshold } = req.params;

    const query = `
        SELECT p.*, i.stock_quantity
        FROM products p
        JOIN inventory i ON p.product_code = i.product_code
        WHERE i.stock_quantity <= ?
    `;

    db.query(query, [threshold], (err, results) => {
        if (err) {
            console.error('Error al obtener productos con bajo stock:', err);
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
// Obtener un producto por nombre (GET BY NAME)
router.get('/name/:name', (req, res) => {
    const { name } = req.params;

    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.name = ?
    `;

    db.query(query, [name], (err, results) => {
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

// Obtener un producto por código de producto (GET BY PRODUCT CODE)
router.get('/code/:product_code', (req, res) => {
    const { product_code } = req.params;

    const query = `
        SELECT p.*, c.name AS category_name, s.name AS supplier_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.product_code = ?
    `;

    db.query(query, [product_code], (err, results) => {
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
    });
});

// Exportar productos como SVG (GET)
router.get('/export/svg', (req, res) => {
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

    if (!name || !product_code || !description ||!category_id ||!supplier_id || !price || !unit) {
        return res.status(400).send('Todos los campos son obligatorios');
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

// Actualizar un producto por código de producto (PUT BY PRODUCT_CODE)
router.put('/code/:product_code', (req, res) => {
    const { product_code } = req.params;
    const { name, description, category_id, supplier_id, price, unit } = req.body;

    if (!name || !price || !unit) {
        return res.status(400).send('Los campos "name", "price" y "unit" son obligatorios');
    }

    const checkQuery = `
        SELECT * FROM products WHERE product_code = ?
    `;

    db.query(checkQuery, [product_code], (err, results) => {
        if (err) {
            console.error('Error al verificar el producto:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Producto no encontrado');
        }

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
            res.status(200).send('Producto actualizado exitosamente');
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