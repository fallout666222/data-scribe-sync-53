
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// GET all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// GET table data
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    // Simple validation to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// UPDATE record
app.put('/api/tables/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const updates = req.body;
  
  // Build SET clause dynamically from request body
  const setEntries = Object.entries(updates).filter(([key]) => key !== 'id');
  const setClause = setEntries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = [...setEntries.map(([_, value]) => value), id];
  
  try {
    // Simple validation to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length}`;
    await pool.query(query, values);
    
    // Fetch and return updated record
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// DELETE record
app.delete('/api/tables/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  
  try {
    // Simple validation to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// INSERT record
app.post('/api/tables/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const newRecord = req.body;
  
  try {
    // Simple validation to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const keys = Object.keys(newRecord);
    const values = Object.values(newRecord);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating record:', err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

