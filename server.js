
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

// Helper function to build WHERE clause from query params
const buildWhereClause = (params) => {
  const filters = [];
  const values = [];
  let paramIndex = 1;

  Object.entries(params).forEach(([key, value]) => {
    // Skip pagination and ordering params
    if (['order', 'limit', 'offset'].includes(key)) {
      return;
    }

    // Parse the filter operator and value
    const [field, operator] = key.split('.');
    let filterValue = value;

    // Handle special filter format: field=op.value
    if (!operator && value.includes('eq.')) {
      filterValue = value.substring(3); // remove "eq."
      filters.push(`${field} = $${paramIndex++}`);
      values.push(filterValue);
    }
    // Handle in operator (comma separated values)
    else if (!operator && value.includes('in.(')) {
      const inValues = value.substring(4, value.length - 1).split(',');
      const placeholders = inValues.map((_, i) => `$${paramIndex + i}`).join(', ');
      filters.push(`${field} IN (${placeholders})`);
      values.push(...inValues);
      paramIndex += inValues.length;
    }
    // Handle like operator
    else if (!operator && value.includes('like.')) {
      filterValue = value.substring(5); // remove "like."
      filters.push(`${field} LIKE $${paramIndex++}`);
      values.push(filterValue.replace(/\*/g, '%'));
    }
    // Handle ilike operator (case insensitive)
    else if (!operator && value.includes('ilike.')) {
      filterValue = value.substring(6); // remove "ilike."
      filters.push(`${field} ILIKE $${paramIndex++}`);
      values.push(filterValue.replace(/\*/g, '%'));
    }
    // Handle greater than
    else if (!operator && value.includes('gt.')) {
      filterValue = value.substring(3); // remove "gt."
      filters.push(`${field} > $${paramIndex++}`);
      values.push(filterValue);
    }
    // Handle less than
    else if (!operator && value.includes('lt.')) {
      filterValue = value.substring(3); // remove "lt."
      filters.push(`${field} < $${paramIndex++}`);
      values.push(filterValue);
    }
    // Handle greater than or equal
    else if (!operator && value.includes('gte.')) {
      filterValue = value.substring(4); // remove "gte."
      filters.push(`${field} >= $${paramIndex++}`);
      values.push(filterValue);
    }
    // Handle less than or equal
    else if (!operator && value.includes('lte.')) {
      filterValue = value.substring(4); // remove "lte."
      filters.push(`${field} <= $${paramIndex++}`);
      values.push(filterValue);
    }
    // Regular field equality
    else if (!operator) {
      filters.push(`${field} = $${paramIndex++}`);
      values.push(value);
    }
  });

  return {
    whereClause: filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '',
    values
  };
};

// Helper function to build ORDER BY clause
const buildOrderClause = (orderParam) => {
  if (!orderParam) return '';
  
  // Format: field.asc or field.desc
  const parts = orderParam.split('.');
  if (parts.length !== 2) return '';
  
  const [field, direction] = parts;
  if (!['asc', 'desc'].includes(direction.toLowerCase())) return '';
  
  return `ORDER BY ${field} ${direction.toUpperCase()}`;
};

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

// GET table data with filtering
app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    // Simple validation to prevent SQL injection (basic approach)
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Build WHERE clause from query params
    const { whereClause, values } = buildWhereClause(req.query);
    
    // Build ORDER BY clause
    const orderClause = buildOrderClause(req.query.order);
    
    // Handle pagination
    const limit = req.query.limit ? `LIMIT ${parseInt(req.query.limit, 10)}` : '';
    const offset = req.query.offset ? `OFFSET ${parseInt(req.query.offset, 10)}` : '';
    
    // Construct and execute the query
    const query = `SELECT * FROM ${tableName} ${whereClause} ${orderClause} ${limit} ${offset}`.trim();
    console.log('Executing query:', query, 'with values:', values);
    
    const result = await pool.query(query, values);
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
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length}`;
    await pool.query(query, values);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// DELETE record
app.delete('/api/tables/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  
  try {
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
