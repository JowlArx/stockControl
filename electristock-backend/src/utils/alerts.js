const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendLowStockAlert = (product) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'electriwebmaster@gmail.com', // Cambia esto al correo del administrador
        subject: 'Alerta de Stock Bajo',
        text: `El producto ${product.name} tiene un stock bajo. Cantidad actual: ${product.stock_quantity}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar la alerta de stock bajo:', error);
        } else {
            console.log('Alerta de stock bajo enviada:', info.response);
        }
    });
};

module.exports = { sendLowStockAlert };