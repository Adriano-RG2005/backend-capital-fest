const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite recibir datos en formato JSON

// Rutas de prueba para el frontend
app.get('/api', (req, res) => {
    res.json({ mensaje: "¡Conexión exitosa con el backend de Capital Fest!" });
});

// Configurar el puerto e iniciar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});