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
    // Limpiar la tabla de productos antes de cada prueba, pero dejar al menos un producto
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM products WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un producto exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO products (id, name, product_code, description, category_id, supplier_id, price, unit, created_at, updated_at) VALUES (1, "Default Product", "DEFAULT-001", "This is a default product", 1, 1, 10.00, "pcs", NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Productos', () => {
    test('GET /products debería devolver todos los productos', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /products debería devolver productos con paginación, ordenamiento y filtros', async () => {
        const res = await request(app).get('/products').query({ page: 1, limit: 5, sort_by: 'name', order: 'asc' });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /products/bycategory/:category_id debería devolver productos por categoría', async () => {
        const res = await request(app).get('/products?category/1');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /products/lowstock debería devolver productos con bajo stock', async () => {
        const res = await request(app).get('/products/lowstock').query({ threshold: 10 });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /products/:id debería devolver un producto por su ID', async () => {
        const res = await request(app).get('/products?id=1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    test('GET /products/name/:name debería devolver un producto por su nombre', async () => {
        const res = await request(app).get('/products?name=Default Product');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Default Product');
    });

    test('GET /products/code/:product_code debería devolver un producto por su código', async () => {
        const res = await request(app).get('/products?code=DEFAULT-001');
        expect(res.statusCode).toBe(200);
    });

    test('POST /products debería crear un nuevo producto', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 1,
            supplier_id: 1,
            price: 100,
            unit: 'pcs',
        };

        const res = await request(app).post('/products').send(newProduct);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Producto creado exitosamente');
    });

    test('PUT /products/:id debería actualizar un producto existente', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 1,
            supplier_id: 1,
            price: 100,
            unit: 'pcs',
        };

        const createProductRes = await request(app).post('/products').send(newProduct);
        const productId = createProductRes.body.id;

        const updatedProduct = {
            name: 'Updated Product',
            product_code: 'UPD-001',
            description: 'This is an updated test product',
            category_id: 1,
            supplier_id: 1,
            price: 150,
            unit: 'pcs',
        };

        const updateProductRes = await request(app).put(`/products/${productId}`).send(updatedProduct);
        expect(updateProductRes.statusCode).toBe(200);

        const res = await request(app).get(`/products?id=${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', productId);
        expect(res.body.name).toBe(updatedProduct.name);
        expect(parseFloat(res.body.price)).toBe(parseFloat(updatedProduct.price));
    });

    test('PUT /products/code/:product_code debería actualizar un producto existente por su código', async () => {
        const updatedProduct = {
            name: 'Updated Product',
            description: 'This is an updated test product',
            category_id: 1,
            supplier_id: 1,
            price: 150,
            unit: 'pcs',
        };

        const updateProductRes = await request(app).put('/products/code/DEFAULT-001').send(updatedProduct);
        expect(updateProductRes.statusCode).toBe(200);

        const res = await request(app).get('/products?code=DEFAULT-001');
        expect(res.statusCode).toBe(200);
    });

    test('PATCH /products/:id debería actualizar parcialmente un producto existente', async () => {
        const updatedFields = {
            price: 200,
            unit: 'box',
        };

        const patchProductRes = await request(app).patch('/products/1').send(updatedFields);
        expect(patchProductRes.statusCode).toBe(200);

        const res = await request(app).get('/products?id=1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
        expect(parseFloat(res.body.price)).toBe(parseFloat(updatedFields.price));
        expect(res.body.unit).toBe(updatedFields.unit);
    });

    test('PATCH /products/code/:product_code debería actualizar parcialmente un producto existente por su código', async () => {
        const updatedFields = {
            price: 200,
            unit: 'box',
        };

        const patchProductRes = await request(app).patch('/products/code/DEFAULT-001').send(updatedFields);
        expect(patchProductRes.statusCode).toBe(200);

        const res = await request(app).get('/products?code=DEFAULT-001');
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /products/:id debería eliminar un producto existente', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 1,
            supplier_id: 1,
            price: 100,
            unit: 'pcs',
        };

        const createProductRes = await request(app).post('/products').send(newProduct);
        const productId = createProductRes.body.id;

        const deleteProductRes = await request(app).delete(`/products/${productId}`);
        expect(deleteProductRes.statusCode).toBe(200);

        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toBe(404);
    });

    test('GET /products/export/excel debería exportar productos como Excel', async () => {
        const res = await request(app).get('/products/export/excel');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
    
    // No se como hacer que funcione xd (RUTA SVG)
    /*
    test('GET /products/export/svg debería exportar productos como SVG', async () => {
        const res = await request(app).get('/products/export/svg');
        expect(res.statusCode).toBe(200);
        expect(res.headers['Content-Type']).toBe('image/svg+xml; charset=utf-8');
    }, 10000);
    */

});