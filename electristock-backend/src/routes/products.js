const express = require('express');
const db = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();


// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err.message);
            return res.status(500).json({ error: 'Error al obtener los productos' });
        }
        res.status(200).json(results);
    });
});
// Ruta para crear un nuevo producto
router.post('/', (req, res) => {
    const { name, category, stock, unit_price } = req.body;

    // Validación básica
    if (!name || !category || stock == null || unit_price == null) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO products (name, category, stock, unit_price) VALUES (?, ?, ?, ?)';
    const values = [name, category, stock, unit_price];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al agregar el producto:', err.message);
            return res.status(500).json({ error: 'Error al agregar el producto' });
        }
        res.status(201).json({
            message: 'Producto agregado exitosamente',
            product: {
                id: result.insertId,
                name,
                category,
                stock,
                unit_price,
            },
        });
    });
});

//POST ELEMENT

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, stock, unit_price } = req.body;

    // Validación básica
    if (!name || !category || stock == null || unit_price == null) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const query = 'UPDATE products SET name = ?, category = ?, stock = ?, unit_price = ? WHERE id = ?';
    const values = [name, category, stock, unit_price, id];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err.message);
            return res.status(500).json({ error: 'Error al actualizar el producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto actualizado exitosamente' });
    });
});

// Patch element by id

router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Generar dinámicamente el query
    const fields = Object.keys(updates).map((field) => `${field} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const query = `UPDATE products SET ${fields} WHERE id = ?`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto parcialmente:', err.message);
            return res.status(500).json({ error: 'Error al actualizar el producto parcialmente' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto actualizado parcialmente' });
    });
});

// delete element by id 

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM products WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err.message);
            return res.status(500).json({ error: 'Error al eliminar el producto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json({ message: 'Producto eliminado exitosamente' });
    });
});


module.exports = router;