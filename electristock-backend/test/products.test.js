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
    // Limpiar la tabla de productos antes de cada prueba
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM products', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Productos', () => {
    /**
     * Prueba que la ruta GET /products devuelva todos los productos.
     * @async
     * @test
     */
    test('GET /products debería devolver todos los productos', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta GET /products/:id devuelva un producto por su ID.
     * @async
     * @test
     */
    test('GET /products/:id debería devolver un producto por su ID', async () => {
        const newProduct = {
            name: 'Jest Product',
            product_code: 'JEST-001',
            description: 'This is a jest-test product',
            category_id: 26,
            supplier_id: 1,
            price: 100,
            unit: 'pcs',
        };

        const createProductRes = await request(app).post('/products').send(newProduct);
        const productId = createProductRes.body.id;
        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', productId);
        expect(res.body.name).toBe(newProduct.name);
    });

    /**
     * Prueba que la ruta POST /products cree un nuevo producto.
     * @async
     * @test
     */
    test('POST /products debería crear un nuevo producto', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 26,
            supplier_id: 1,
            price: 100,
            unit: 'pcs',
        };

        const res = await request(app).post('/products').send(newProduct);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Producto creado exitosamente');
    });

    /**
     * Prueba que la ruta PUT /products/:id actualice un producto existente.
     * @async
     * @test
     */
    test('PUT /products/:id debería actualizar un producto existente', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 26,
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
            category_id: 26,
            supplier_id: 2,
            price: 150,
            unit: 'pcs',
        };

        const updateProductRes = await request(app).put(`/products/${productId}`).send(updatedProduct);
        expect(updateProductRes.statusCode).toBe(200);

        const res = await request(app).get(`/products/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', productId);
        expect(res.body.name).toBe(updatedProduct.name);
        expect(parseFloat(res.body.price)).toBe(parseFloat(updatedProduct.price));
    });

    /**
     * Prueba que la ruta DELETE /products/:id elimine un producto existente.
     * @async
     * @test
     */
    test('DELETE /products/:id debería eliminar un producto existente', async () => {
        const newProduct = {
            name: 'Test Product',
            product_code: 'TEST-001',
            description: 'This is a test product',
            category_id: 26,
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
});