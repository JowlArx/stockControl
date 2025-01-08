const request = require('supertest');
const app = require('../src/app'); // Ruta al archivo principal de tu aplicación
const { connect, disconnect, db } = require('../src/models/db'); // Importar las funciones connect, disconnect y db

require('dotenv').config(); // Carga las variables de entorno desde .env

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await disconnect();
});

beforeEach(async () => {
    // Limpiar la tabla de registros de inventario antes de cada prueba, pero dejar al menos un registro
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM inventory_logs WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un registro de inventario exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO inventory_logs (id, product_code, quantity, action, reason, created_at) VALUES (1, "DEFAULT-001", 100, "add", "JEST", NOW()) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Registros de Inventario', () => {
    /**
     * Prueba que la ruta GET /inventory_logs debería devolver todos los registros de inventario.
     * @async
     * @test
     */
    test('GET /inventory_logs debería devolver todos los registros de inventario', async () => {
        const res = await request(app).get('/inventory_logs');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta POST /inventory_logs debería crear un nuevo registro de inventario.
     * @async
     * @test
     */
    test('POST /inventory_logs debería crear un nuevo registro de inventario', async () => {
        const newInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 50,
            action: 'add',
            reason: 'JEST'
        };

        const res = await request(app).post('/inventory_logs').send(newInventoryLog);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Registro creado exitosamente');
    });

    /**
     * Prueba que la ruta GET /inventory_logs/:id debería devolver un registro de inventario por su ID.
     * @async
     * @test
     */
    test('GET /inventory_logs/:id debería devolver un registro de inventario por su ID', async () => {
        const newInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 50,
            action: 'add',
            reason: 'JEST'
        };

        const createInventoryLogRes = await request(app).post('/inventory_logs').send(newInventoryLog);
        const inventoryLogId = createInventoryLogRes.body.id;
        const res = await request(app).get(`/inventory_logs/${inventoryLogId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', inventoryLogId);
        expect(res.body.quantity).toBe(newInventoryLog.quantity);
    });

    /**
     * Prueba que la ruta PATCH /inventory_logs/:id debería actualizar un registro de inventario existente.
     * @async
     * @test
     */
    test('PATCH /inventory_logs/:id debería actualizar un registro de inventario existente', async () => {
        const updatedInventoryLog = {
            quantity: 15,
            action: 'remove',
            reason: 'JEST'
        };

        const updateInventoryLogRes = await request(app).patch(`/inventory_logs/1`).send(updatedInventoryLog);
        expect(updateInventoryLogRes.statusCode).toBe(200);

        const res = await request(app).get(`/inventory_logs/1`);
    });

    /**
     * Prueba que la ruta DELETE /inventory_logs/:id debería eliminar un registro de inventario existente.
     * @async
     * @test
     */
    test('DELETE /inventory_logs/:id debería eliminar un registro de inventario existente', async () => {
        const newInventoryLog = {
            product_code: 'DEFAULT-001',
            quantity: 50,
            action: 'add',
            reason: 'JEST'
        };

        const createInventoryLogRes = await request(app).post('/inventory_logs').send(newInventoryLog);
        const inventoryLogId = createInventoryLogRes.body.id;

        const deleteInventoryLogRes = await request(app).delete(`/inventory_logs/${inventoryLogId}`);
        expect(deleteInventoryLogRes.statusCode).toBe(200);

        const res = await request(app).get(`/inventory_logs/${inventoryLogId}`);
        expect(res.statusCode).toBe(404);
    });
});