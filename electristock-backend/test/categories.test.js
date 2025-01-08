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
    // Limpiar la tabla de categorías antes de cada prueba, pero dejar al menos una categoría
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM categories WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos una categoría exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO categories (id, name, description) VALUES (1, "Default Category", "This is a default category") ON DUPLICATE KEY UPDATE name = VALUES(name)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de categorías', () => {
    /**
     * Prueba que la ruta GET /categories debería devolver todas las categorías.
     * @async
     * @test
     */
    test('GET /categories debería devolver todas las categorías', async () => {
        const res = await request(app).get('/categories');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta GET /categories/:id debería devolver una categoría por su ID.
     * @async
     * @test
     */
    test('GET /categories/:id debería devolver una categoría por su ID', async () => {
        const newCategory = {
            name: 'Test Category',
            description: 'This is a test category',
        };

        const createCategoryRes = await request(app).post('/categories').send(newCategory);
        const categoryId = createCategoryRes.body.id;
        const res = await request(app).get(`/categories/${categoryId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', categoryId);
        expect(res.body.name).toBe(newCategory.name);
    });

    /**
     * Prueba que la ruta POST /categories debería crear una nueva categoría.
     * @async
     * @test
     */
    test('POST /categories debería crear una nueva categoría', async () => {
        const newCategory = {
            name: 'Test Category',
            description: 'This is a test category',
        };

        const res = await request(app).post('/categories').send(newCategory);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Categoria creada exitosamente');
    });

    /**
     * Prueba que la ruta PUT /categories/:id debería actualizar una categoría existente.
     * @async
     * @test
     */
    test('PUT /categories/:id debería actualizar una categoría existente', async () => {
        const newCategory = {
            name: 'Test Category',
            description: 'This is a test category',
        };

        const createCategoryRes = await request(app).post('/categories').send(newCategory);
        const categoryId = createCategoryRes.body.id;

        const updatedCategory = {
            name: 'Updated Category',
            description: 'This is an updated test category',
        };

        const updateCategoryRes = await request(app).put(`/categories/${categoryId}`).send(updatedCategory);
        expect(updateCategoryRes.statusCode).toBe(200);

        const res = await request(app).get(`/categories/${categoryId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', categoryId);
        expect(res.body.name).toBe(updatedCategory.name);
    });

    /**
     * Prueba que la ruta DELETE /categories/:id debería eliminar una categoría existente.
     * @async
     * @test
     */
    test('DELETE /categories/:id debería eliminar una categoría existente', async () => {
        const newCategory = {
            name: 'Test Category',
            description: 'This is a test category',
        };

        const createCategoryRes = await request(app).post('/categories').send(newCategory);
        const categoryId = createCategoryRes.body.id;

        const deleteCategoryRes = await request(app).delete(`/categories/${categoryId}`);
        expect(deleteCategoryRes.statusCode).toBe(200);

        const res = await request(app).get(`/categories/${categoryId}`);
        expect(res.statusCode).toBe(404);
    });
});