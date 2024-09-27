const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const translate = require('node-google-translate-skidz');
const app = express();
const port = process.env.PORT || 3000; // Cambiado para Vercel

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/search', async (req, res) => {
    const { departamento, keyword, localizacion } = req.body;

    let url = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true';
    url += keyword ? `&q=${keyword}` : '&q=""';
    if (departamento) url += `&departmentId=${departamento}`;
    if (localizacion) url += `&geoLocation=${localizacion}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
});

// Ruta para traducir propiedades de las cards
app.post('/translate-card', async (req, res) => {
    const { title, culture, dynasty } = req.body;

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
        console.error('Error al traducir atributos de las obras:', error);
        res.status(500).json({ error: 'Error al traducir atributos de las obras' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});