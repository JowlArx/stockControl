    # ElectriStock

    ElectriStock es una aplicación para la gestión de inventarios y proveedores, desarrollada con una arquitectura de frontend y backend separada. El frontend está construido con React y Vite, mientras que el backend utiliza Express y MySQL.

    ## Estructura del Proyecto

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
    ```

    ## Backend

    ### Instalación

    1. Navega al directorio del backend:
        ```sh
        cd electristock-backend
        ```
    2. Instala las dependencias:
        ```sh
        npm install
        ```

    ### Configuración

    Crea un archivo `.env` en el directorio `electristock-backend` con el siguiente contenido:

    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD="*****"
    DB_NAME="Nombre de la db"
    PORT=3000
    ```

    ### Ejecución

    Para iniciar el servidor de desarrollo:
    ```sh
    npm run dev
    ```

    ### Pruebas

    Para ejecutar las pruebas:
    ```sh
    npm test
    ```

    ## Frontend

    ### Instalación

    1. Navega al directorio del frontend:
        ```sh
        cd electristock-frontend/electristock-front
        ```
    2. Instala las dependencias:
        ```sh
        npm install
        ```

    ### Ejecución

    Para iniciar el servidor de desarrollo:
    ```sh
    npm run dev
    ```

    ### Configuración del Proxy

    El archivo `vite.config.js` está configurado para redirigir las solicitudes API al backend:
    ```js
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    ```

    ## Estructura de la Base de Datos

    La base de datos MySQL contiene las siguientes tablas:

    - `users`
    - `suppliers`
    - `categories`
    - `products`
    - `inventory`

    ## Rutas de la API

    ### Usuarios

    - `GET /users`: Obtener todos los usuarios.
    - `GET /users/:id`: Obtener un usuario por ID.
    - `POST /users`: Crear un nuevo usuario.
    - `PUT /users/:id`: Actualizar un usuario existente.
    - `DELETE /users/:id`: Eliminar un usuario.

    ### Proveedores

    - `GET /suppliers`: Obtener todos los proveedores.
    - `GET /suppliers/:id`: Obtener un proveedor por ID.
    - `POST /suppliers`: Crear un nuevo proveedor.
    - `PUT /suppliers/:id`: Actualizar un proveedor existente.
    - `DELETE /suppliers/:id`: Eliminar un proveedor.

    ### Categorías

    - `GET /categories`: Obtener todas las categorías.
    - `GET /categories/:id`: Obtener una categoría por ID.
    - `POST /categories`: Crear una nueva categoría.
    - `PUT /categories/:id`: Actualizar una categoría existente.
    - `DELETE /categories/:id`: Eliminar una categoría.

    ### Productos

    - `GET /products`: Obtener todos los productos.
    - `GET /products/:id`: Obtener un producto por ID.
    - `POST /products`: Crear un nuevo producto.
    - `PUT /products/:id`: Actualizar un producto existente.
    - `DELETE /products/:id`: Eliminar un producto.

    ### Inventario

    - `GET /inventory`: Obtener todos los registros de inventario.
    - `GET /inventory/:id`: Obtener un registro de inventario por ID.
    - `POST /inventory`: Crear un nuevo registro de inventario.
    - `PUT /inventory/:id`: Actualizar un registro de inventario existente.
    - `DELETE /inventory/:id`: Eliminar un registro de inventario.

    ## Contribuciones

    Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cualquier cambio que desees realizar.

    ## Licencia

    Este proyecto está licenciado bajo la Licencia MIT.
