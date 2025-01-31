require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const usersRoutes = require('./routes/users');
const authenticateToken = require('./middleware/auth'); // Importa el middleware de autenticación
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const suppliersRoutes = require('./routes/suppliers');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const inventoryLogsRoutes = require('./routes/inventory_logs');
const contractsRoutes = require('./routes/contracts'); // Rutas de contratos

const app = express();

// Configuración de middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('API de ElectriStock');
});

// Definición de rutas
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

app.use('/products', authenticateToken, productsRoutes);
app.use('/categories', authenticateToken, categoriesRoutes);
app.use('/suppliers', authenticateToken, suppliersRoutes);
app.use('/inventory', authenticateToken, inventoryRoutes);
app.use('/inventory_logs', authenticateToken, inventoryLogsRoutes);
app.use('/contracts', authenticateToken, contractsRoutes); // Rutas protegidas

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;