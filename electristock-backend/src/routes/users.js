const express = require('express');
const { db } = require('../models/db'); // Importa la conexión a la base de datos
const router = express.Router();
const bcrypt = require('bcrypt'); // Importa bcrypt para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Importa jwt para generar tokens
const nodemailer = require('nodemailer'); // Importa nodemailer para enviar correos electrónicos
const crypto = require('crypto'); // Importa crypto para generar tokens de verificación
const authenticateToken = require('../middleware/auth'); // Importa el middleware de autenticación
const authorizeRole = require('../middleware/authRole'); // Importa el middleware de autorización
const { logAudit } = require('../utils/audit'); // Importa la función de auditoría
const { checkDuplicateEmail } = require('../middleware/duplicateEmail'); // Importa el middleware para verificar correos electrónicos duplicados

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Obtener todos los usuarios (GET)
router.get('/', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
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

// Cambiar el rol de un usuario (PATCH /users/:id/role)
router.patch('/:id/role', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['admin', 'user', 'staff']; // Define los roles permitidos

    if (!role) {
        return res.status(400).send('El campo "role" es obligatorio');
    }

    if (!allowedRoles.includes(role)) {
        return res.status(400).send('El rol proporcionado no es válido');
    }

    const query = `
        UPDATE users
        SET role = ?, updated_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [role, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el rol del usuario:', err);
            return res.status(500).send(`Error interno del servidor: ${err.message}`);
        }        
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        logAudit(req.user.id, 'update', 'user', id, `Role changed to ${role}`);
        res.status(200).send('Rol del usuario actualizado exitosamente');
    });
});

// Buscar usuarios por nombre, correo electrónico o rol (GET /users/search)
router.get('/search', authenticateToken, authorizeRole(['admin', 'staff']), (req, res) => {
    const { username, full_name, email, role  } = req.query;
    let query = `   
        SELECT u.*
        FROM users u
        WHERE 1=1
    `;
    const params = [];

    if (username) {
        query += ' AND username LIKE ?';
        params.push(`%${username}%`);
    }
    if (email) {
        query += ' AND email LIKE ?';
        params.push(`%${email}%`);  
    }
    if (email) {
        query += ' AND email LIKE ?';
        params.push(`%${email}%`);
    }
    if (role) {
        query += ' AND role = ?';
        params.push(role);
    }
    if (full_name) {
        query += ' AND full_name LIKE ?';
        params.push(`%${full_name}%`);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al buscar usuarios:', err);
            return res.status(500).send('Error interno del servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un usuario por ID (GET BY ID)
router.get('/:id', authenticateToken, authorizeRole(['admin', 'user', 'staff']), (req, res) => {
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

// Aplicar el middleware antes de crear un nuevo usuario
router.post('/', duplicateEmail, async (req, res) => {
    const { username, password, full_name, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).send('Los campos "username", "password" y "email" son obligatorios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
        const role = 'user'; // Asigna el rol "user" por defecto
        const verificationToken = crypto.randomBytes(3).toString('hex'); // Genera un token de verificación de 6 dígitos hexadecimales
        const tokenExpiration = new Date(Date.now() + 3600000); // El token expira en 1 hora

        const query = `
            INSERT INTO users (username, password_hash, full_name, email, role, verification_token, token_expiration, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(query, [username, hashedPassword, full_name, email, role, verificationToken, tokenExpiration], (err, result) => {
            if (err) {
                console.error('Error al crear el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verificación de cuenta',
                text: `Tu código de verificación es: ${verificationToken}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                    return res.status(500).send('Error interno del servidor');
                }
                res.status(201).json({
                    id: result.insertId,
                    username,
                    message: 'Usuario creado exitosamente. Por favor, verifica tu correo electrónico.',
                });
            });
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Crear un nuevo usuario (POST)
router.post('/', async (req, res) => {
    const { username, password, full_name, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).send('Los campos "username", "password" y "email" son obligatorios');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
        const role = 'user'; // Asigna el rol "user" por defecto
        const verificationToken = crypto.randomBytes(3).toString('hex'); // Genera un token de verificación de 6 dígitos hexadecimales
        const tokenExpiration = new Date(Date.now() + 3600000); // El token expira en 1 hora

        const query = `
            INSERT INTO users (username, password_hash, full_name, email, role, verification_token, token_expiration, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        db.query(query, [username, hashedPassword, full_name, email, role, verificationToken, tokenExpiration], (err, result) => {
            if (err) {
                console.error('Error al crear el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verificación de cuenta',
                text: `Tu código de verificación es: ${verificationToken}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                    return res.status(500).send('Error interno del servidor');
                }
                res.status(201).json({
                    id: result.insertId,
                    username,
                    message: 'Usuario creado exitosamente. Por favor, verifica tu correo electrónico.',
                });
            });
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Actualizar un usuario (PUT)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
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
            logAudit(req.user.id, 'update', 'user', id, 'User updated');
            res.status(200).send('Usuario actualizado exitosamente');
        });
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Eliminar un usuario (DELETE)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;

    const verificationToken = crypto.randomBytes(3).toString('hex'); // Genera un token de verificación
    const tokenExpiration = new Date(Date.now() + 3600000); // El token expira en 1 hora

    const updateQuery = `UPDATE users SET verification_token = ?, token_expiration = ? WHERE id = ?`;
    db.query(updateQuery, [verificationToken, tokenExpiration, id], (err) => {
        if (err) {
            console.error('Error al actualizar el token de verificación:', err);
            return res.status(500).send('Error interno del servidor');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email, // Enviar el correo al administrador que está intentando eliminar la cuenta
            subject: 'Verificación de eliminación de cuenta',
            text: `Haz clic en el siguiente enlace para verificar la eliminación de la cuenta: http://localhost:3000/users/verify-delete?token=${verificationToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo electrónico:', error);
                return res.status(500).send('Error interno del servidor');
            }
            res.status(200).send('Correo electrónico de verificación enviado. Por favor, verifica tu correo electrónico para completar la eliminación de la cuenta.');
        });
    });
});

// Verificar la eliminación de la cuenta (GET /users/verify-delete)
router.get('/verify-delete', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('El token de verificación es obligatorio');
    }

    const query = `SELECT * FROM users WHERE verification_token = ? AND token_expiration > NOW()`;
    db.query(query, [token], (err, results) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length === 0) {
            return res.status(400).send('Token no válido o expirado');
        }

        const user = results[0];
        const deleteQuery = `DELETE FROM users WHERE id = ?`;
        db.query(deleteQuery, [user.id], (err) => {
            if (err) {
                console.error('Error al eliminar el usuario:', err);
                return res.status(500).send('Error interno del servidor');
            }
            logAudit(req.user.id, 'delete', 'user', user.id, 'User deleted');
            res.status(200).send('Usuario eliminado exitosamente');
        });
    });
});

module.exports = router;