require('dotenv').config(); // Carga las variables de entorno desde .env
const cors = require('cors');

const app = require('./src/app');
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});