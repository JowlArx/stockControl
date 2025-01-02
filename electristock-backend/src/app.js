const express = require('express');
const productsRoutes = require('./routes/products'); // Importa las rutas

const app = express();

app.get('/', (req, res) => {
    res.send('API de Electristock');
});

app.use(express.json()); // Middleware para manejar JSON
app.use('/products', productsRoutes); // Rutas base para productos

module.exports = app;
