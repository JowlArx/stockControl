require('dotenv').config(); // Carga las variables de entorno desde .env

const app = require('./src/app'); // Asegúrate de que estés importando correctamente `app.js`

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
