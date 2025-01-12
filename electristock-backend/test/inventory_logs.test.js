require('dotenv').config(); // Carga las variables de entorno desde .env
const request = require('supertest');
const app = require('../src/app'); // Ruta al archivo principal de tu aplicación
const { connect, disconnect, db } = require('../src/models/db'); // Importar las funciones connect, disconnect y db

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await disconnect();
});

beforeEach(async () => {
    // Limpiar la tabla de logs de inventario antes de cada prueba, pero dejar al menos un registro
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM inventory_logs WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un registro de log de inventario exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO inventory_logs (id, product_code, quantity, action, reason, created_at) VALUES (1, "DEFAULT-001", 100, "add", "Initial stock", NOW()) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Logs de Inventario', () => {
    test('GET /inventory_logs debería devolver todos los registros de logs', async () => {
        const res = await request(app).get('/inventory_logs');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /inventory_logs/byproduct//?product_code= debería devolver movimientos del inventario para un producto específico', async () => {
        const res = await request(app).get('/inventory_logs/byproduct/?product_code=DEFAULT-001');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /inventory_logs/filter debería filtrar logs por fecha, acción o cantidad', async () => {
        const res = await request(app).get('/inventory_logs/filter').query({ action: 'add', min_quantity: 50 });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /inventory_logs/:id debería devolver un registro de log por su ID', async () => {
        const res = await request(app).get('/inventory_logs/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    test('POST /inventory_logs debería crear un nuevo registro de log', async () => {
        const newInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 50,
            action: 'add',
            reason: 'Test log'
        };

        const res = await request(app).post('/inventory_logs').send(newInventoryLog);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Registro creado exitosamente');
    });

    test('PATCH /inventory_logs/:id debería actualizar un registro de log existente', async () => {
        const updatedInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 75,
            action: 'remove',
            reason: 'Updated log'
        };

        const updateInventoryLogRes = await request(app).patch('/inventory_logs/1').send(updatedInventoryLog);
        expect(updateInventoryLogRes.statusCode).toBe(200);

        const res = await request(app).get('/inventory_logs/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
        expect(res.body.quantity).toBe(updatedInventoryLog.quantity);
        expect(res.body.action).toBe(updatedInventoryLog.action);
    });

    test('DELETE /inventory_logs/:id debería eliminar un registro de log existente', async () => {
        const newInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 50,
            action: 'add',
            reason: 'Test log'
        };

        const createInventoryLogRes = await request(app).post('/inventory_logs').send(newInventoryLog);
        const logId = createInventoryLogRes.body.id;

        const deleteInventoryLogRes = await request(app).delete(`/inventory_logs/${logId}`);
        expect(deleteInventoryLogRes.statusCode).toBe(200);

        const res = await request(app).get(`/inventory_logs/${logId}`);
        expect(res.statusCode).toBe(404);
    });
});