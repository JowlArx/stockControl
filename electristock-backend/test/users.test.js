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
    // Limpiar la tabla de usuarios antes de cada prueba, pero dejar al menos un usuario
    await new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE id > 1', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });

    // Asegurarse de que al menos un usuario exista
    await new Promise((resolve, reject) => {
        db.query('INSERT INTO users (id, username, password_hash, full_name, email, role) VALUES (1, "default_user", "$2b$10$defaultpasswordhash", "Default User", "default@example.com", "admin") ON DUPLICATE KEY UPDATE username = VALUES(username)', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
});

describe('Rutas de Usuarios', () => {
    /**
     * Prueba que la ruta GET /users debería devolver todos los usuarios.
     * @async
     * @test
     */
    test('GET /suppliers debería devolver todos los usuarios', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    /**
     * Prueba que la ruta GET /users/:id debería devolver un usuario por su ID.
     * @async
     * @test
     */
    test('GET /users/:id debería devolver un usuario por su ID', async () => {
        const newUser = {
            username: 'jest_user',
            password: 'securePassword123',
            full_name: 'Jest Test User',
            email: 'jest_user@example.com',
            role: 'user',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;
        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body.username).toBe(newUser.username);
    });

    /**
     * Prueba que la ruta POST /users debería crear un nuevo usuario.
     * @async
     * @test
     */
    test('POST /users debería crear un nuevo usuario', async () => {
        const newUser = {
            username: 'test_user',
            password: 'securePassword123',
            full_name: 'Test User',
            email: 'test_user@example.com',
            role: 'user',
        };

        const res = await request(app).post('/users').send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('message', 'Usuario creado exitosamente');
    });

    /**
     * Prueba que la ruta PUT /users/:id debería actualizar un usuario existente.
     * @async
     * @test
     */
    test('PUT /users/:id debería actualizar un usuario existente', async () => {
        const newUser = {
            username: 'test_user',
            password: 'securePassword123',
            full_name: 'Test User',
            email: 'test_user@example.com',
            role: 'user',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const updatedUser = {
            username: `updated_user_${Date.now()}`,
            password: 'newSecurePassword123',
            full_name: 'Updated Test User',
            email: `updated_${Date.now()}@example.com`,
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
     * Prueba que la ruta DELETE /users/:id debería eliminar un usuario existente.
     * @async
     * @test
     */
    test('DELETE /users/:id debería eliminar un usuario existente', async () => {
        const newUser = {
            username: 'test_user',
            password: 'securePassword123',
            full_name: 'Test User',
            email: 'test_user@example.com',
            role: 'user',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const deleteUserRes = await request(app).delete(`/users/${userId}`);
        expect(deleteUserRes.statusCode).toBe(200);

        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(404);
    });
});