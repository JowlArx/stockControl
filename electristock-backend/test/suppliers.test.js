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
    // Limpiar la tabla de proveedores antes de cada prueba, pero dejar al menos un proveedor
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM suppliers WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un proveedor exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO suppliers (id, name, contact_name, contact_email, contact_phone, address) VALUES (1, "Default Supplier", "Default Contact", "contact@default.com", "1234567890", "Default Address") ON DUPLICATE KEY UPDATE name = VALUES(name)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Proveedores', () => {
    test('GET /suppliers debería devolver todos los proveedores', async () => {
        const res = await request(app).get('/suppliers');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /suppliers debería devolver proveedores con paginación, ordenamiento y filtros', async () => {
        const res = await request(app).get('/suppliers').query({ page: 1, limit: 5, sort_by: 'name', order: 'asc' });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /suppliers/:id debería devolver un proveedor por su ID', async () => {
        const res = await request(app).get('/suppliers/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    test('POST /suppliers debería crear un nuevo proveedor', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'Test Contact',
            contact_email: 'contact@test.com',
            contact_phone: '0987654321',
            address: 'Test Address',
        };

        const res = await request(app).post('/suppliers').send(newSupplier);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Proveedor cargado exitosamente');
    });

    test('PUT /suppliers/:id debería actualizar un proveedor existente', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'Test Contact',
            contact_email: 'contact@test.com',
            contact_phone: '0987654321',
            address: 'Test Address',
        };

        const createSupplierRes = await request(app).post('/suppliers').send(newSupplier);
        const supplierId = createSupplierRes.body.id;

        const updatedSupplier = {
            name: 'Updated Supplier',
            contact_name: 'Updated Contact',
            contact_email: 'updated@test.com',
            contact_phone: '1234567890',
            address: 'Updated Address',
        };

        const updateSupplierRes = await request(app).put(`/suppliers/${supplierId}`).send(updatedSupplier);
        expect(updateSupplierRes.statusCode).toBe(200);

        const res = await request(app).get(`/suppliers/${supplierId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', supplierId);
        expect(res.body.name).toBe(updatedSupplier.name);
    });

    test('DELETE /suppliers/:id debería eliminar un proveedor existente', async () => {
        const newSupplier = {
            name: 'Test Supplier',
            contact_name: 'Test Contact',
            contact_email: 'contact@test.com',
            contact_phone: '0987654321',
            address: 'Test Address',
        };

        const createSupplierRes = await request(app).post('/suppliers').send(newSupplier);
        const supplierId = createSupplierRes.body.id;

        const deleteSupplierRes = await request(app).delete(`/suppliers/${supplierId}`);
        expect(deleteSupplierRes.statusCode).toBe(200);

        const res = await request(app).get(`/suppliers/${supplierId}`);
        expect(res.statusCode).toBe(404);
    });

    test('GET /suppliers/products/:supplier_id debería devolver productos suministrados por un proveedor específico', async () => {
        const res = await request(app).get('/suppliers/products/1');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /suppliers/search debería buscar proveedores por nombre o contacto', async () => {
        const res = await request(app).get('/suppliers?').query({ name: 'Default' });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});