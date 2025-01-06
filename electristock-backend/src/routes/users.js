const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();
const bcrypt = require('bcrypt'); // Importa bcrypt para encriptar contraseñas

// Obtener todos los usuarios (GET)
router.get('/', (req, res) => {
    const query = `
        SELECT u.* 
        FROM users u
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un usuario por ID (GET BY ID)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT u.* 
        FROM users u
        WHERE u.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo usuario (POST)
router.post('/', async (req, res) => {
    const { username, password, full_name, email, role } = req.body;

    if (!username || !password || !email || !role) {
        return res.status(400).send('Los campos "username", "password", "email" y "role" son obligatorios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña

        const query = `
            INSERT INTO users (username, password_hash, full_name, email, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(query, [username, hashedPassword, full_name, email, role], (err, result) => {
            if (err) {
                console.error('Error al crear el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }
            res.status(201).json({
                id: result.insertId,
                username, // Incluye el nombre de usuario en la respuesta
                message: 'Usuario creado exitosamente',
            });
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Actualizar un usuario (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, full_name, email, role } = req.body;

    if (!username || !email || !role) {
        return res.status(400).send('Los campos "username", "email" y "role" son obligatorios');
    }

    try {
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10); // Encriptar la nueva contraseña si se proporciona
        }

        const query = `
            UPDATE users
            SET username = ?, ${password ? 'password_hash = ?, ' : ''} full_name = ?, email = ?, role = ?, updated_at = NOW()
            WHERE id = ?
        `;

        const queryParams = password ? [username, hashedPassword, full_name, email, role, id] : [username, full_name, email, role, id];

        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.error('Error al actualizar el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Usuario no encontrado');
            }
            res.status(200).send('Usuario actualizado exitosamente');
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Eliminar un usuario (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM users
        WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.status(200).send('Usuario eliminado exitosamente');
    });
});

module.exports = router;