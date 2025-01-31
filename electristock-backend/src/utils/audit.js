const { db } = require('../models/db');

const logAudit = (userId, action, entity, entityId, details) => {
    const query = `
        INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [userId, action, entity, entityId, details], (err) => {
        if (err) {
            console.error('Error al registrar la auditoría:', err);
        }
    });
};

module.exports = { logAudit };