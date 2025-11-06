const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter); // Apply rate limiting to API routes

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database connection
const initDB = async () => {
  const maxRetries = 10;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('Database connection pool created');
      
      // Test the connection
      const connection = await pool.getConnection();
      
      // Create table if not exists
      await connection.query(`
        CREATE TABLE IF NOT EXISTS items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      connection.release();
      console.log('Database table initialized');
      return; // Success
    } catch (error) {
      retries++;
      console.error(`Error initializing database (attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        console.log('Retrying in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('Max retries reached. Starting server without database connection.');
      }
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create item
app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO items (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
app.put('/api/items/:id', async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const [result] = await pool.query(
      'UPDATE items SET name = ?, description = ? WHERE id = ?',
      [name, description || '', req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Health check (not rate-limited to allow frequent monitoring)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Start server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
