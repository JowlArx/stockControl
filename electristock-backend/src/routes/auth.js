const express = require('express');
const { db } = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Importa nodemailer para enviar correos electrónicos
const router = express.Router();

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar cualquier servicio de correo electrónico
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Los campos "username" y "password" son obligatorios');
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuario o contraseña incorrectos');
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).send('Usuario o contraseña incorrectos');
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.header('Authorization', `Bearer ${token}`).send({ token });
    });
});

// Ruta para solicitar la recuperación de contraseña
router.post('/forgotpassword', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('El campo "email" es obligatorio');
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error al buscar el usuario:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length === 0) {
            return res.status(400).send('No se encontró un usuario con ese correo electrónico');
        }

        const user = results[0];
        const token = crypto.randomInt(100000, 999999).toString(); // Genera un token de 6 dígitos
        const tokenExpiration = new Date(Date.now() + 3600000); // El token expira en 1 hora

        const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?`;
        db.query(updateQuery, [token, tokenExpiration, user.id], (err) => {
            if (err) {
                console.error('Error al actualizar el token de restablecimiento:', err);
                return res.status(500).send('Error interno del servidor');
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Recuperación de contraseña',
                text: `Tu código de recuperación de contraseña es: ${token}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar el correo electrónico:', error);
                    return res.status(500).send('Error interno del servidor');
                }
                res.status(200).send('Correo electrónico de recuperación enviado');
            });
        });
    });
});

// Ruta para restablecer la contraseña
router.post('/resetpassword', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send('Los campos "token" y "newPassword" son obligatorios');
    }

    const query = `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()`;
    db.query(query, [token], async (err, results) => {
        if (err) {
            console.error('Error al buscar el token:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length === 0) {
            return res.status(400).send('Token no válido o expirado');
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?`;
        db.query(updateQuery, [hashedPassword, user.id], (err) => {
            if (err) {
                console.error('Error al restablecer la contraseña:', err);
                return res.status(500).send('Error interno del servidor');
            }
            res.status(200).send('Contraseña restablecida exitosamente');
        });
    });
});

module.exports = router;