# ElectriStock

ElectriStock es una aplicación para la gestión de inventarios y proveedores, desarrollada con una arquitectura de frontend y backend separada. El frontend está construido con React y Vite, mientras que el backend utiliza Express y MySQL.

## Versiones Utilizadas

### Backend
- Node.js: 18.17.1
- Express: 4.21.2
- MySQL: 8.0.33
- dotenv: 16.4.7
- bcrypt: 5.1.1
- bcryptjs: 2.4.3
- exceljs: 4.4.0
- jsonwebtoken: 9.0.2
- mysql2: 3.12.0

### Frontend
- React: 18.3.1
- Vite: 6.0.5
- ESLint: 9.17.0
- @vitejs/plugin-react: 4.3.4
- @eslint/js: 9.17.0
- @types/react: 18.3.18
- @types/react-dom: 18.3.5
- eslint-plugin-react: 7.37.2
- eslint-plugin-react-hooks: 5.0.0
- eslint-plugin-react-refresh: 0.4.16
- globals: 15.14.0

## Estructura

    ```
    electristock/
    ├── electristock-backend/
    │   ├── src/
    │   │   ├── models/
    │   │   │   └── db.js
    │   │   ├── routes/
    │   │   │   ├── categories.js
    │   │   │   ├── inventory.js
    │   │   │   ├── products.js
    │   │   │   ├── suppliers.js
    │   │   │   └── users.js
    │   │   └── app.js
    │   ├── test/
    │   │   ├── categories.test.js
    │   │   ├── products.test.js
    │   │   ├── suppliers.test.js
    │   │   └── users.test.js
    │   ├── .env
    │   ├── .gitattributes
    │   ├── .gitignore
    │   ├── index.js
    │   └── package.json
    └── electristock-frontend/
        └── electristock-front/
            ├── src/
            │   ├── App.css
            │   ├── App.jsx
            │   ├── index.css
            │   └── main.jsx
            ├── .gitignore
            ├── eslint.config.js
            ├── index.html
            ├── package.json
            ├── README.md
            └── vite.config.js

## Funcionalidades del backend

### Rutas de la API

#### Usuarios
- `GET /users`: Obtener todos los usuarios.
- `GET /users/:id`: Obtener un usuario por ID.
- `POST /users`: Crear un nuevo usuario.
- `PUT /users/:id`: Actualizar un usuario existente.
- `DELETE /users/:id`: Eliminar un usuario.
- `PATCH /users/:id/role`: Cambiar el rol de un usuario.
- `GET /users/search`: Buscar usuarios por nombre, correo electrónico o rol.

#### Proveedores
- `GET /suppliers`: Obtener todos los proveedores.
- `GET /suppliers/:id`: Obtener un proveedor por ID.
- `POST /suppliers`: Crear un nuevo proveedor.
- `PUT /suppliers/:id`: Actualizar un proveedor existente.
- `DELETE /suppliers/:id`: Eliminar un proveedor.
- `GET /suppliers/products/:supplier_id`: Obtener productos suministrados por un proveedor específico.
- `GET /suppliers/search`: Buscar proveedores por nombre o contacto.

#### Categorías
- `GET /categories`: Obtener todas las categorías.
- `GET /categories/:id`: Obtener una categoría por ID.
- `POST /categories`: Crear una nueva categoría.
- `PUT /categories/:id`: Actualizar una categoría existente.
- `DELETE /categories/:id`: Eliminar una categoría.
- `GET /categories/products/:category_id`: Obtener productos asociados a una categoría específica.
- `GET /categories/tree`: Obtener una estructura jerárquica de categorías.

#### Productos
- `GET /products`: Obtener todos los productos.
- `GET /products/:id`: Obtener un producto por ID.
- `GET /products/name/:name`: Obtener un producto por nombre.
- `GET /products/code/:product_code`: Obtener un producto por código.
- `POST /products`: Crear un nuevo producto.
- `PUT /products/:id`: Actualizar un producto existente.
- `PUT /products/code/:product_code`: Actualizar un producto existente por su código.
- `PATCH /products/:id`: Actualizar parcialmente un producto existente.
- `PATCH /products/code/:product_code`: Actualizar parcialmente un producto existente por su código.
- `DELETE /products/:id`: Eliminar un producto existente.
- `GET /products/export/excel`: Exportar productos como Excel.
- `GET /products/export/svg`: Exportar productos como SVG.
- `GET /products/bycategory/:category_id`: Obtener productos por categoría.
- `GET /products/lowstock`: Obtener productos con stock por debajo de un umbral.

#### Inventario
- `GET /inventory`: Obtener todos los registros de inventario.
- `GET /inventory/:id`: Obtener un registro de inventario por ID.
- `POST /inventory`: Crear un nuevo registro de inventario.
- `PUT /inventory/:id`: Actualizar un registro de inventario existente.
- `DELETE /inventory/:id`: Eliminar un registro de inventario.
- `PATCH /inventory/update-massive`: Realizar actualizaciones masivas en el inventario.
- `GET /inventory/stock-status`: Obtener la lista de productos con su cantidad actual.
- `GET /inventory/summary`: Obtener un resumen del inventario.
- `GET /inventory/location/:location`: Obtener registros de inventario por ubicación.

#### Logs de Inventario
- `GET /inventory_logs`: Obtener todos los registros de logs.
- `GET /inventory_logs/by-product/:product_code`: Obtener movimientos del inventario para un producto específico.
- `GET /inventory_logs/filter`: Filtrar logs por fecha, acción o cantidad.
- `GET /inventory_logs/:id`: Obtener un registro de log por su ID.
- `POST /inventory_logs`: Crear un nuevo registro de log.
- `PATCH /inventory_logs/:id`: Actualizar un registro de log existente.
- `DELETE /inventory_logs/:id`: Eliminar un registro de log existente.

## Funcionalidades del Frontend

### Componentes Principales
- **App.jsx**: Componente principal que realiza una solicitud a la API y muestra el mensaje recibido.
- **main.jsx**: Punto de entrada de la aplicación React.

### Configuración de Vite
- **vite.config.js**: Configuración de Vite, incluyendo el proxy para redirigir las solicitudes API al backend.

### Configuración de ESLint
- **eslint.config.js**: Configuración de ESLint para el proyecto, incluyendo reglas para React y hooks.

## Pruebas

Las pruebas están implementadas utilizando `jest` y `supertest` para verificar el correcto funcionamiento de las rutas de la API.
