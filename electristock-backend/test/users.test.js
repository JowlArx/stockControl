/**
 * @fileoverview Pruebas para las rutas de usuarios en la aplicación.
 * @requires dotenv
 * @requires supertest
 * @requires ../src/app
 * @requires ../src/models/db
 */

require('dotenv').config(); // Carga las variables de entorno desde .env
const request = require('supertest');
const app = require('../src/app'); // Ruta al archivo principal de tu aplicación
const { connect, disconnect, db } = require('../src/models/db'); // Importar las funciones connect, disconnect y db

/**
 * Conecta a la base de datos antes de ejecutar todas las pruebas.
 * @async
 */
beforeAll(async () => {
    await connect();
});

/**
 * Desconecta de la base de datos después de ejecutar todas las pruebas.
 * @async
 */
afterAll(async () => {
    await disconnect();
});

/**
 * Limpia la tabla de usuarios antes de cada prueba.
 * @async
 */
beforeEach(async () => {
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM users', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Users', () => {
    /**
     * Prueba que la ruta GET /users devuelva todos los usuarios.
     * @async
     * @test
     */
    test('GET /users debería devolver todos los usuarios', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta GET /users/:id devuelva un usuario por su ID.
     * @async
     * @test
     */
    test('GET /users/:id debería devolver un usuario por su ID', async () => {
        const uniqueSuffix = Date.now();
        const newUser = {
            username: `test_user_${uniqueSuffix}`,
            password: 'securePassword123',
            full_name: 'Test User',
            email: `test_${uniqueSuffix}@example.com`,
            role: 'staff',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body.username).toBe(newUser.username);
    });

    /**
     * Prueba que la ruta POST /users cree un nuevo usuario.
     * @async
     * @test
     */
    test('POST /users debería crear un nuevo usuario', async () => {
        const uniqueSuffix = Date.now();
        const newUser = {
            username: `test_user_${uniqueSuffix}`,
            password: 'securePassword123',
            full_name: 'Test User',
            email: `test_${uniqueSuffix}@example.com`,
            role: 'staff',
        };

        const res = await request(app).post('/users').send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.username).toBe(newUser.username);
    });

    /**
     * Prueba que la ruta PUT /users/:id actualice un usuario existente.
     * @async
     * @test
     */
    test('PUT /users/:id debería actualizar un usuario existente', async () => {
        const uniqueSuffix = Date.now();
        const newUser = {
            username: `test_user_${uniqueSuffix}`,
            password: 'securePassword123',
            full_name: 'Test User',
            email: `test_${uniqueSuffix}@example.com`,
            role: 'staff',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const updatedUser = {
            username: `updated_user_${uniqueSuffix}`,
            password: 'newSecurePassword123',
            full_name: 'Updated Test User',
            email: `updated_${uniqueSuffix}@example.com`,
            role: 'admin',
        };

        const updateUserRes = await request(app).put(`/users/${userId}`).send(updatedUser);
        expect(updateUserRes.statusCode).toBe(200);

        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body.username).toBe(updatedUser.username);
        expect(res.body.email).toBe(updatedUser.email);
        expect(res.body.role).toBe(updatedUser.role);
    });

    /**
     * Prueba que la ruta DELETE /users/:id elimine un usuario existente.
     * @async
     * @test
     */
    test('DELETE /users/:id debería eliminar un usuario existente', async () => {
        const uniqueSuffix = Date.now();
        const newUser = {
            username: `test_user_${uniqueSuffix}`,
            password: 'securePassword123',
            full_name: 'Test User',
            email: `test_${uniqueSuffix}@example.com`,
            role: 'staff',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const deleteUserRes = await request(app).delete(`/users/${userId}`);
        expect(deleteUserRes.statusCode).toBe(200);

        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(404);
    });
});