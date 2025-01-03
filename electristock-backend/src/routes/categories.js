const express = require('express');
const db = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todas las categorias
router.get('/', (req, res) => {
    const query = `
        SELECT * FROM categories
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener categorias:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener una categoria por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT * FROM categories
        WHERE id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Categoria no encontrada');
        }
        res.status(200).json(results[0]);
    });
});

// Crear una nueva categoria
router.post('/', (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('El campo "name" es obligatorio');
    }

    const query = `
        INSERT INTO categories (name, description, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
    `;

    db.query(query, [name, description], (err, result) => {
        if (err) {
            console.error('Error al crear la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(201).send({ id: result.insertId, message: 'Categoria creada exitosamente' });
    });
});

// Actualizar una categoria (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('El campo "name" es obligatorio');
    }

    const query = `
        UPDATE categories
        SET name = ?, description = ?, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [name, description, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Categoria no encontrada');
        }
        res.status(200).send('Categoria actualizada exitosamente');
    });
});

// Actualizar parcialmente una categoria (PATCH)
router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    if (Object.keys(fields).length === 0) {
        return res.status(400).send('No se proporcionaron campos para actualizar');
    }

    const columns = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    const query = `
        UPDATE categories
        SET ${columns}, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [...values, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar parcialmente la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Categoria no encontrada');
        }
        res.status(200).send('Categoria actualizada parcialmente');
    });
});

// Eliminar una categoria (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM categories
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la categoria:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Categoria no encontrada');
        }
        res.status(200).send('Categoria eliminada exitosamente');
    });
});

module.exports = router;
