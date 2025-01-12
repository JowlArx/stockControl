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
    // Limpiar la tabla de inventario antes de cada prueba, pero dejar al menos un registro
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM inventory WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un registro de inventario exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO inventory (id, product_code, stock_quantity, location, updated_at) VALUES (1, "DEFAULT-001", 100, "Default Location", NOW()) ON DUPLICATE KEY UPDATE stock_quantity = VALUES(stock_quantity)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Inventario', () => {
    /**
     * Prueba que la ruta GET /inventory debería devolver todos los registros de inventario.
     * @async
     * @test
     */
    test('GET /inventory debería devolver todos los registros de inventario', async () => {
        const res = await request(app).get('/inventory');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta POST /inventory debería crear un nuevo registro de inventario.
     * @async
     * @test
     */
    test('POST /inventory debería crear un nuevo registro de inventario', async () => {
        const newInventory = {
            product_code: 'DEFAULT-001',
            stock_quantity: 50,
            location: 'Test Location',
        };

        const res = await request(app).post('/inventory').send(newInventory);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Registro de inventario creado exitosamente');
    });

    /**
     * Prueba que la ruta GET /inventory/:id debería devolver un registro de inventario por su ID.
     * @async
     * @test
     */
    test('GET /inventory/:id debería devolver un registro de inventario por su ID', async () => {
        const res = await request(app).get(`/inventory/?id=1`);
        expect(res.statusCode).toBe(200);
    });

    /**
     * Prueba que la ruta PATCH /inventory/:id debería actualizar un registro de inventario existente.
     * @async
     * @test
     */
    test('PATCH /inventory/:id debería actualizar un registro de inventario existente', async () => {
        const newInventory = {
            product_code: 'DEFAULT-001',
            stock_quantity: 50,
            location: 'Test Location',
        };

        const createInventoryRes = await request(app).post('/inventory').send(newInventory);
        expect(createInventoryRes.statusCode).toBe(201);
        const inventoryId = createInventoryRes.body.id;

        const updatedInventory = {
            stock_quantity: 75,
            location: 'Updated Location',
        };

        const updateInventoryRes = await request(app).patch(`/inventory/${inventoryId}`).send(updatedInventory);
        expect(updateInventoryRes.statusCode).toBe(200);

        const res = await request(app).get(`/inventory/?${inventoryId}`);
        expect(res.statusCode).toBe(200);
    });

    /**
     * Prueba que la ruta DELETE /inventory/:id debería eliminar un registro de inventario existente.
     * @async
     * @test
     */
    test('DELETE /inventory/:id debería eliminar un registro de inventario existente', async () => {
        const newInventory = {
            product_code: 'DEFAULT-001',
            stock_quantity: 50,
            location: 'Test Location',
        };

        const createInventoryRes = await request(app).post('/inventory').send(newInventory);
        const inventoryId = createInventoryRes.body.id;

        const deleteInventoryRes = await request(app).delete(`/inventory/${inventoryId}`);
        expect(deleteInventoryRes.statusCode).toBe(200);

        const res = await request(app).get(`/inventory/${inventoryId}`);
        expect(res.statusCode).toBe(404);
    });
});