const express = require('express');
const path = require('path');
const translate = require('node-google-translate-skidz'); // Importa el paquete de traducción
const app = express();
const port = 3000;

app.use(express.json()); // Middleware para parsear JSON

// Ruta para traducir propiedades de las cards
app.post('/translate-card', async (req, res) => {
    const { title, culture, dynasty } = req.body;
    console.log('Recibiendo datos para traducir:', title, culture, dynasty);
    
    try {
        const translatedTitle = await translate({ text: title, source: 'en', target: 'es' });
        const translatedCulture = await translate({ text: culture, source: 'en', target: 'es' });
        const translatedDynasty = await translate({ text: dynasty, source: 'en', target: 'es' });

        res.json({
            translatedTitle: translatedTitle.translation,
            translatedCulture: translatedCulture.translation,
            translatedDynasty: translatedDynasty.translation
        });
    } catch (error) {
        console.error('Error al traducir atribtos de las obras:', error);
        res.status(500).json({ error: 'Error al traducir atribtos de las obras' });
    }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Enviar el archivo HTML al acceder a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejar la ruta para el archivo JS de la API
app.get('/scripts.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scripts.js'));
});

// Configurar un puerto para la aplicación
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});