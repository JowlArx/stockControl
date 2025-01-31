const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendInventoryChangeNotification = (log) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'arceurbefernando@gmail.com', // Cambia esto al correo del administrador
        subject: 'Notificación de Cambio en el Inventario',
        text: `Se ha realizado un cambio en el inventario:
        Producto: ${log.product_code}
        Cantidad: ${log.quantity}
        Acción: ${log.action}
        Razón: ${log.reason}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar la notificación de cambio en el inventario:', error);
        } else {
            console.log('Notificación de cambio en el inventario enviada:', info.response);
        }
    });
};

module.exports = { sendInventoryChangeNotification };