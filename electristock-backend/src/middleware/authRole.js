const authorizeRole = (roles) => {
    return (req, res, next) => {
        const { role } = req.user; // El rol del usuario está en el token JWT decodificado

        if (!roles.includes(role)) {
            return res.status(403).send('Acceso denegado. No tienes permiso para realizar esta acción.');
        }

        next();
    };
};

module.exports = authorizeRole;