require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true
    }
};

// Connect to database
sql.connect(dbConfig, err => {
    if (err) {
        console.error('Database connection failed: ', err);
    } else {
        console.log('Connected to database');
    }
});

// Routes
app.get('/', (req, res) => {
    res.send('API is running');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT * FROM Categories');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get category by ID
app.get('/api/categories/:id', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Categories WHERE CategoryID = ${req.params.id}`);
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get products by category ID
app.get('/api/categories/:id/products', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Products WHERE CategoryID = ${req.params.id}`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new category
app.post('/api/categories', async (req, res) => {
    try {
        const { CategoryName, Description, CreatedDate, IsActive } = req.body;
        const request = new sql.Request();
        await request.query(
            `INSERT INTO Categories (CategoryName, Description, CreatedDate, IsActive) 
             VALUES ('${CategoryName}', '${Description}', '${CreatedDate}', ${IsActive})`
        );
        res.status(201).send('Category created');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { ProductName, CategoryID, Price, Quantity } = req.body;
        const request = new sql.Request();
        await request.query(
            `INSERT INTO Products (ProductName, CategoryID, Price, Quantity) 
             VALUES ('${ProductName}', ${CategoryID}, ${Price}, ${Quantity})`
        );
        res.status(201).send('Product created');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

