const express = require('express');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const usersRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const inventoryLogsRoutes = require('./routes/inventory_logs');
const authRoutes = require('./routes/auth');
const contractsRoutes = require('./routes/contracts'); // Importa las rutas de contratos
const authenticateToken = require('./middleware/auth');

const app = express();

app.get('/', (req, res) => {
    res.send('API de Electristock');
});

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/products', authenticateToken, productsRoutes);
app.use('/categories', authenticateToken, categoriesRoutes);
app.use('/suppliers', authenticateToken, suppliersRoutes);
app.use('/users', usersRoutes);
app.use('/inventory', authenticateToken, inventoryRoutes);
app.use('/inventory_logs', authenticateToken, inventoryLogsRoutes);
app.use('/contracts', authenticateToken, contractsRoutes); // Rutas protegidas para contratos

module.exports = app;