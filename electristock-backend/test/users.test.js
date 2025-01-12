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
    test('GET /users debería devolver todos los usuarios', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /users debería devolver usuarios con paginación, ordenamiento y filtros', async () => {
        const res = await request(app).get('/users').query({ page: 1, limit: 5, sort_by: 'username', order: 'asc' });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /users/:id debería devolver un usuario por su ID', async () => {
        const res = await request(app).get('/users/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

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
            username: 'updated_user',
            password: 'newSecurePassword123',
            full_name: 'Updated Test User',
            email: 'updated_user@example.com',
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

    test('PATCH /users/:id/role debería cambiar el rol de un usuario', async () => {
        const newUser = {
            username: 'test_user',
            password: 'securePassword123',
            full_name: 'Test User',
            email: 'test_user@example.com',
            role: 'user',
        };

        const createUserRes = await request(app).post('/users').send(newUser);
        const userId = createUserRes.body.id;

        const updatedRole = {
            role: 'admin',
        };

        const updateRoleRes = await request(app).patch(`/users/${userId}/role`).send(updatedRole);
        expect(updateRoleRes.statusCode).toBe(200);

        const res = await request(app).get(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', userId);
        expect(res.body.role).toBe(updatedRole.role);
    });

    test('GET /users/search debería buscar usuarios por nombre, correo electrónico o rol', async () => {
        const res = await request(app).get('/users/search').query({ name: 'default_user' });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});