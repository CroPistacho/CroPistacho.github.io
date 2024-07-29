const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Simulación de una base de datos con productos
const products = [
    { id: 1, name: "Air Jordan 1 Dark Mocha", price: 61.34 },
    { id: 2, name: "Travis Scott Air Jordan 1 Mocha", price: 61.34 },
    // Agrega los demás productos aquí
];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
