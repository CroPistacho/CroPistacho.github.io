// server/index.js
const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your-project-id.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

// Rutas de la API
app.get('/api/products', async (req, res) => {
    try {
        const snapshot = await db.collection('products').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(products);
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price } = req.body;
        const file = req.file;

        if (!name || !price || !file) {
            return res.status(400).send('Faltan datos del producto o imagen.');
        }

        const blob = bucket.file(`${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', err => {
            res.status(500).send('Error al subir la imagen');
        });

        blobStream.on('finish', async () => {
            const imageUrl = await blob.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            const newProduct = {
                name,
                price: parseFloat(price),
                imageUrl: imageUrl[0]
            };

            const docRef = await db.collection('products').add(newProduct);
            res.status(201).json({ id: docRef.id, ...newProduct });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        res.status(500).send('Error al añadir el producto');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
