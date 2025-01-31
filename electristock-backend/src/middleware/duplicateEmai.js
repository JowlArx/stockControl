
const checkDuplicateEmail = (req, res, next) => {
    const { email } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo electrónico:', err);
            return res.status(500).send('Error interno del servidor');
        }

        if (results.length > 0) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        next();
    });
};

module.exports = checkDuplicateEmail;