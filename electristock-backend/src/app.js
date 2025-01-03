const express = require('express');
const productsRoutes = require('./routes/products'); // Importa las rutas
const categoriesRoutes = require('./routes/categories'); // Importa las rutas de categorías
const suppliersRoutes = require('./routes/suppliers'); // Importa las rutas de proveedores
const usersRoutes = require('./routes/users'); // Importa las rutas de usuarios

const app = express();

app.get('/', (req, res) => {
    res.send('API de Electristock');
});

app.use(express.json()); // Middleware para manejar JSON
app.use('/products', productsRoutes); // Rutas base para productos
app.use('/categories', categoriesRoutes); // Rutas base para categorías
app.use('/suppliers', suppliersRoutes); // Rutas base para proveedores')
app.use('/users', usersRoutes); // Rutas base para usuarios

module.exports = app;