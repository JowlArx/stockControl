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
    // Limpiar la tabla de proveedores antes de cada prueba
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM suppliers', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de proveedores', () => {
    /**
     * Prueba que la ruta GET /suppliers devuelva todos los proveedores.
     * @async
     * @test
     */
    test('GET /suppliers debería devolver todos los proveedores', async () => {
        const res = await request(app).get('/suppliers');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta GET /suppliers/:id devuelva un proveedor por su ID.
     * @async
     * @test
     */
    test('GET /suppliers/:id debería devolver un proveedor por su ID', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'John Doe',
            contact_email: 'john.doe@example.com',
            contact_phone: '1234567890',
            address: '123 Test St, Test City, TS 12345',
        };

        const createSupplierRes = await request(app).post('/suppliers').send(newSupplier);
        const supplierId = createSupplierRes.body.id;
        const res = await request(app).get(`/suppliers/${supplierId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', supplierId);
        expect(res.body.name).toBe(newSupplier.name);
    });

    /**
     * Prueba que la ruta POST /suppliers cree un nuevo proveedor.
     * @async
     * @test
     */
    test('POST /suppliers debería crear un nuevo proveedor', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'John Doe',
            contact_email: 'john.doe@example.com',
            contact_phone: '1234567890',
            address: '123 Test St, Test City, TS 12345',
        };

        const res = await request(app).post('/suppliers').send(newSupplier);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Proveedor cargado exitosamente');
    });

    /**
     * Prueba que la ruta PUT /suppliers/:id actualice un proveedor existente.
     * @async
     * @test
     */
    test('PUT /suppliers/:id debería actualizar un proveedor existente', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'John Doe',
            contact_email: 'john.doe@example.com',
            contact_phone: '1234567890',
            address: '123 Test St, Test City, TS 12345',
        };

        const createSupplierRes = await request(app).post('/suppliers').send(newSupplier);
        const supplierId = createSupplierRes.body.id;

        const updatedSupplier = {
            name: 'Updated Supplier',
            contact_name: 'Jane Doe',
            contact_email: 'jane.doe@example.com',
            contact_phone: '0987654321',
            address: '456 Updated St, Updated City, US 54321',
        };

        const updateSupplierRes = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
        expect(updateSupplierRes.statusCode).toBe(200);

        const res = await request(app).get(`/suppliers/${supplierId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', supplierId);
        expect(res.body.name).toBe(updatedSupplier.name);
    });

    /**
     * Prueba que la ruta DELETE /suppliers/:id elimine un proveedor existente.
     * @async
     * @test
     */
    test('DELETE /suppliers/:id debería eliminar un proveedor existente', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'John Doe',
            contact_email: 'john.doe@example.com',
            contact_phone: '1234567890',
            address: '123 Test St, Test City, TS 12345',
        };

        const createSupplierRes = await request(app).post('/suppliers').send(newSupplier);
        const supplierId = createSupplierRes.body.id;

        const deleteSupplierRes = await request(app).delete(`/suppliers/${supplierId}`);
        expect(deleteSupplierRes.statusCode).toBe(200);

        const res = await request(app).get(`/suppliers/${supplierId}`);
        expect(res.statusCode).toBe(404);
    });
});