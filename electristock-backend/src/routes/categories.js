const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todas las categorías (GET)
router.get('/', (req, res) => {
    const query = `
        SELECT c.* 
        FROM categories c
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener categorías:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener una categoría por ID (GET BY ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT * FROM categories
        WHERE id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la categoría:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Categoría no encontrada');
        }
        res.status(200).json(results[0]);
    });
});

// Crear una nueva categoría (POST)
router.post('/', (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('El nombre de la categoria es obligatorio');
    }

    const query = `
        INSERT INTO categories (name, description)
        VALUES (?, ?)
    `;

    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error al crear la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Categoria creada exitosamente' });
    });
});

// Actualizar una categoría (PUT)
router.put('/:id', (req, res) => {
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
    });
});

// Eliminar una categoría (DELETE)
router.delete('/:id', (req, res) => {
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
    });
});

module.exports = router;
