const express = require('express');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const usersRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const inventoryLogsRoutes = require('./routes/inventory_logs');
const authRoutes = require('./routes/auth'); // Importa las rutas de autenticación
const authenticateToken = require('./middleware/auth'); // Importa el middleware de autenticación

const app = express();

app.get('/', (req, res) => {
    res.send('API de Electristock');
});

app.use(express.json()); // Middleware para manejar JSON
app.use('/auth', authRoutes); // Rutas de autenticación
app.use('/products', authenticateToken, productsRoutes); // Rutas protegidas para productos
app.use('/categories', authenticateToken, categoriesRoutes); // Rutas protegidas para categorías
app.use('/suppliers', authenticateToken, suppliersRoutes); // Rutas protegidas para proveedores
app.use('/users', usersRoutes); // Rutas para usuarios (sin protección para creación de usuario)
app.use('/inventory', authenticateToken, inventoryRoutes); // Rutas protegidas para inventario
app.use('/inventory_logs', authenticateToken, inventoryLogsRoutes); // Rutas protegidas para logs de inventario

module.exports = app;